use std::collections::HashMap;
use std::fs::OpenOptions;
use std::io::Write;
use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use tokio::io::AsyncReadExt;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::mpsc;
use x25519_dalek::StaticSecret;

use crate::crypto::{compute_shared_secret, decrypt_payload};
use crate::protocol::Packet;
use crate::storage::{Database, MessageRecord};

struct FileTransferState {
    file_path: PathBuf,
    total_chunks: u64,
    received_chunks: u64,
    sender_id: String,
    file_name: String,
    file_size: u64,
    is_image: bool,
    shared_key: [u8; 32],
}

pub struct TcpP2pServer {
    port: u16,
    my_secret: StaticSecret,
    db: Database,
    download_dir: PathBuf,
    event_sender: mpsc::UnboundedSender<MessageRecord>,
    active_transfers: Arc<Mutex<HashMap<String, FileTransferState>>>,
}

impl TcpP2pServer {
    pub fn new(
        port: u16,
        my_secret: StaticSecret,
        db: Database,
        download_dir: PathBuf,
        event_sender: mpsc::UnboundedSender<MessageRecord>,
    ) -> Self {
        Self {
            port,
            my_secret,
            db,
            download_dir,
            event_sender,
            active_transfers: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn start(self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let addr = SocketAddr::from(([0, 0, 0, 0], self.port));
        let listener = TcpListener::bind(addr).await?;

        let my_secret = Arc::new(self.my_secret);
        let db = self.db.clone();
        let event_sender = self.event_sender.clone();
        let download_dir = self.download_dir.clone();
        let active_transfers = self.active_transfers.clone();

        tokio::spawn(async move {
            loop {
                match listener.accept().await {
                    Ok((socket, peer_addr)) => {
                        let my_sec = Arc::clone(&my_secret);
                        let db_clone = db.clone();
                        let sender_clone = event_sender.clone();
                        let dl_clone = download_dir.clone();
                        let trans_clone = Arc::clone(&active_transfers);

                        tokio::spawn(async move {
                            let _ = Self::handle_connection(
                                socket,
                                peer_addr,
                                my_sec,
                                db_clone,
                                sender_clone,
                                dl_clone,
                                trans_clone,
                            )
                            .await;
                        });
                    }
                    Err(_) => break,
                }
            }
        });

        Ok(())
    }

    async fn handle_connection(
        mut socket: TcpStream,
        _peer_addr: SocketAddr,
        my_secret: Arc<StaticSecret>,
        db: Database,
        event_sender: mpsc::UnboundedSender<MessageRecord>,
        download_dir: PathBuf,
        active_transfers: Arc<Mutex<HashMap<String, FileTransferState>>>,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut len_buf = [0u8; 4];

        while socket.read_exact(&mut len_buf).await.is_ok() {
            let packet_len = u32::from_be_bytes(len_buf) as usize;
            if packet_len > 64 * 1024 * 1024 {
                return Err("Packet exceeded maximum size".into());
            }

            let mut body_buf = vec![0u8; packet_len];
            socket.read_exact(&mut body_buf).await?;

            let packet: Packet = bincode::deserialize(&body_buf)?;
            match packet {
                Packet::EncryptedMessage {
                    msg_id,
                    sender_id,
                    sender_name,
                    recipient_id,
                    group_id,
                    reply_to_id,
                    ciphertext,
                    nonce,
                    created_at,
                } => {
                    if let Ok(Some(peer)) = db.get_peer(&sender_id) {
                        if let Ok(pubkey_bytes) = hex::decode(&peer.pubkey) {
                            if pubkey_bytes.len() == 32 {
                                let mut arr = [0u8; 32];
                                arr.copy_from_slice(&pubkey_bytes);
                                let shared = compute_shared_secret(&my_secret, &arr);

                                if let Ok(plain_bytes) =
                                    decrypt_payload(&shared, &ciphertext, &nonce)
                                {
                                    if let Ok(raw_content) = String::from_utf8(plain_bytes) {
                                        let (msg_type, content) = if let Some(sticker_id) = raw_content.strip_prefix("[STICKER:") {
                                            if let Some(id) = sticker_id.strip_suffix("]") {
                                                ("sticker".to_string(), id.to_string())
                                            } else {
                                                ("text".to_string(), raw_content)
                                            }
                                        } else {
                                            ("text".to_string(), raw_content)
                                        };

                                        let resolved_name = sender_name.unwrap_or(peer.name);

                                        let record = MessageRecord {
                                            id: msg_id,
                                            sender_id,
                                            sender_name: Some(resolved_name),
                                            recipient_id,
                                            group_id,
                                            content,
                                            message_type: msg_type,
                                            file_name: None,
                                            file_path: None,
                                            file_size: None,
                                            reply_to_id,
                                            is_mine: false,
                                            created_at,
                                        };

                                        let _ = db.save_message(&record);
                                        let _ = event_sender.send(record);
                                    }
                                }
                            }
                        }
                    }
                }

                Packet::FileTransferInit {
                    transfer_id,
                    sender_id,
                    file_name,
                    file_size,
                    total_chunks,
                    is_image,
                } => {
                    let _ = std::fs::create_dir_all(&download_dir);
                    let target_path = download_dir.join(&file_name);

                    if let Ok(Some(peer)) = db.get_peer(&sender_id) {
                        if let Ok(pubkey_bytes) = hex::decode(&peer.pubkey) {
                            if pubkey_bytes.len() == 32 {
                                let mut arr = [0u8; 32];
                                arr.copy_from_slice(&pubkey_bytes);
                                let shared = compute_shared_secret(&my_secret, &arr);

                                let _ = OpenOptions::new()
                                    .create(true)
                                    .write(true)
                                    .truncate(true)
                                    .open(&target_path);

                                let state = FileTransferState {
                                    file_path: target_path,
                                    total_chunks,
                                    received_chunks: 0,
                                    sender_id,
                                    file_name,
                                    file_size,
                                    is_image,
                                    shared_key: shared,
                                };

                                active_transfers
                                    .lock()
                                    .unwrap()
                                    .insert(transfer_id, state);
                            }
                        }
                    }
                }

                Packet::FileChunk {
                    transfer_id,
                    chunk_index: _,
                    ciphertext,
                    nonce,
                } => {
                    let mut transfers = active_transfers.lock().unwrap();
                    if let Some(state) = transfers.get_mut(&transfer_id) {
                        if let Ok(chunk_plain) =
                            decrypt_payload(&state.shared_key, &ciphertext, &nonce)
                        {
                            if let Ok(mut file) = OpenOptions::new()
                                .append(true)
                                .open(&state.file_path)
                            {
                                let _ = file.write_all(&chunk_plain);
                            }

                            state.received_chunks += 1;
                            if state.received_chunks >= state.total_chunks {
                                let file_path_str = state.file_path.to_string_lossy().to_string();
                                let msg_type = if state.is_image { "image" } else { "file" };

                                let record = MessageRecord {
                                    id: format!("file-{}", transfer_id),
                                    sender_id: state.sender_id.clone(),
                                    sender_name: None,
                                    recipient_id: "me".into(),
                                    group_id: None,
                                    content: format!("ส่งไฟล์: {}", state.file_name),
                                    message_type: msg_type.into(),
                                    file_name: Some(state.file_name.clone()),
                                    file_path: Some(file_path_str),
                                    file_size: Some(state.file_size),
                                    reply_to_id: None,
                                    is_mine: false,
                                    created_at: chrono::Local::now().format("%H:%M").to_string(),
                                };

                                let _ = db.save_message(&record);
                                let _ = event_sender.send(record);
                            }
                        }
                    }
                }

                Packet::GroupInvite {
                    group_id,
                    name,
                    members,
                    creator_id: _,
                    created_at,
                } => {
                    use crate::storage::GroupRecord;
                    let group = GroupRecord {
                        group_id,
                        name,
                        members,
                        created_at,
                        last_message: None,
                        last_message_time: None,
                        unread_count: 0,
                    };
                    let _ = db.create_group(&group);
                }

                Packet::CallSignal {
                    call_id: _,
                    sender_id: _,
                    signal_type: _,
                    payload: _,
                } => {}

                _ => {}
            }
        }

        Ok(())
    }
}
