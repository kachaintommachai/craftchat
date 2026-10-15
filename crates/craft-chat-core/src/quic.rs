use std::collections::HashMap;
use std::fs::{File, OpenOptions};
use std::io::{Read, Write};
use std::net::SocketAddr;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use quinn::{ClientConfig, Endpoint, ServerConfig};
use rustls::pki_types::{CertificateDer, PrivateKeyDer};
use tokio::sync::mpsc;
use x25519_dalek::StaticSecret;

use crate::crypto::{compute_shared_secret, decrypt_payload, encrypt_payload};
use crate::protocol::Packet;
use crate::storage::{Database, MessageRecord};

const CHUNK_SIZE: usize = 64 * 1024;

/// Generate a self-signed TLS 1.3 certificate for QUIC peer-to-peer communication
pub fn generate_self_signed_cert() -> Result<(Vec<CertificateDer<'static>>, PrivateKeyDer<'static>), Box<dyn std::error::Error + Send + Sync>> {
    let subject_alt_names = vec!["localhost".to_string(), "craft-chat.local".to_string()];
    let certified = rcgen::generate_simple_self_signed(subject_alt_names)?;
    let cert_der = CertificateDer::from(certified.cert.der().to_vec());
    let key_der = PrivateKeyDer::try_from(certified.signing_key.serialize_der())
        .map_err(|e| format!("Failed to parse private key DER: {:?}", e))?;

    Ok((vec![cert_der], key_der))
}

/// Dummy certificate verifier for P2P QUIC that trusts self-signed certs
/// (E2EE payload authentication is handled at the application layer via X25519-ChaCha20Poly1305)
#[derive(Debug)]
struct SkipServerVerification;

impl rustls::client::danger::ServerCertVerifier for SkipServerVerification {
    fn verify_server_cert(
        &self,
        _end_entity: &CertificateDer<'_>,
        _intermediates: &[CertificateDer<'_>],
        _server_name: &rustls::pki_types::ServerName<'_>,
        _ocsp_response: &[u8],
        _now: rustls::pki_types::UnixTime,
    ) -> Result<rustls::client::danger::ServerCertVerified, rustls::Error> {
        Ok(rustls::client::danger::ServerCertVerified::assertion())
    }

    fn verify_tls12_signature(
        &self,
        _message: &[u8],
        _cert: &CertificateDer<'_>,
        _dss: &rustls::DigitallySignedStruct,
    ) -> Result<rustls::client::danger::HandshakeSignatureValid, rustls::Error> {
        Ok(rustls::client::danger::HandshakeSignatureValid::assertion())
    }

    fn verify_tls13_signature(
        &self,
        _message: &[u8],
        _cert: &CertificateDer<'_>,
        _dss: &rustls::DigitallySignedStruct,
    ) -> Result<rustls::client::danger::HandshakeSignatureValid, rustls::Error> {
        Ok(rustls::client::danger::HandshakeSignatureValid::assertion())
    }

    fn supported_verify_schemes(&self) -> Vec<rustls::SignatureScheme> {
        vec![
            rustls::SignatureScheme::ED25519,
            rustls::SignatureScheme::ECDSA_NISTP256_SHA256,
            rustls::SignatureScheme::RSA_PSS_SHA256,
        ]
    }
}

pub fn create_quic_server_config(
    certs: Vec<CertificateDer<'static>>,
    key: PrivateKeyDer<'static>,
) -> Result<ServerConfig, Box<dyn std::error::Error + Send + Sync>> {
    let mut server_crypto = rustls::ServerConfig::builder()
        .with_no_client_auth()
        .with_single_cert(certs, key)?;
    server_crypto.alpn_protocols = vec![b"craft-chat-quic/1".to_vec()];

    let server_config = ServerConfig::with_crypto(Arc::new(
        quinn::crypto::rustls::QuicServerConfig::try_from(server_crypto)?,
    ));
    Ok(server_config)
}

pub fn create_quic_client_config() -> Result<ClientConfig, Box<dyn std::error::Error + Send + Sync>> {
    let mut client_crypto = rustls::ClientConfig::builder()
        .dangerous()
        .with_custom_certificate_verifier(Arc::new(SkipServerVerification))
        .with_no_client_auth();
    client_crypto.alpn_protocols = vec![b"craft-chat-quic/1".to_vec()];

    let client_config = ClientConfig::new(Arc::new(
        quinn::crypto::rustls::QuicClientConfig::try_from(client_crypto)?,
    ));
    Ok(client_config)
}

struct QuicFileTransferState {
    file_path: PathBuf,
    total_chunks: u64,
    received_chunks: u64,
    sender_id: String,
    file_name: String,
    file_size: u64,
    is_image: bool,
    shared_key: [u8; 32],
}

/// QUIC Inbound Server handling multiplexed UDP streams
pub struct QuicP2pServer {
    port: u16,
    my_secret: StaticSecret,
    db: Database,
    download_dir: PathBuf,
    event_sender: mpsc::UnboundedSender<MessageRecord>,
    active_transfers: Arc<Mutex<HashMap<String, QuicFileTransferState>>>,
}

impl QuicP2pServer {
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

    pub async fn start(self) -> Result<SocketAddr, Box<dyn std::error::Error + Send + Sync>> {
        let (certs, key) = generate_self_signed_cert()?;
        let server_config = create_quic_server_config(certs, key)?;

        let bind_addr = SocketAddr::from(([0, 0, 0, 0], self.port));
        let endpoint = Endpoint::server(server_config, bind_addr)?;
        let local_addr = endpoint.local_addr()?;

        let my_secret = Arc::new(self.my_secret);
        let db = self.db.clone();
        let event_sender = self.event_sender.clone();
        let download_dir = self.download_dir.clone();
        let active_transfers = self.active_transfers.clone();

        tokio::spawn(async move {
            while let Some(incoming) = endpoint.accept().await {
                let my_sec = Arc::clone(&my_secret);
                let db_clone = db.clone();
                let sender_clone = event_sender.clone();
                let dl_clone = download_dir.clone();
                let trans_clone = Arc::clone(&active_transfers);

                tokio::spawn(async move {
                    if let Ok(connection) = incoming.await {
                        let _ = Self::handle_connection(
                            connection,
                            my_sec,
                            db_clone,
                            sender_clone,
                            dl_clone,
                            trans_clone,
                        )
                        .await;
                    }
                });
            }
        });

        Ok(local_addr)
    }

    async fn handle_connection(
        connection: quinn::Connection,
        my_secret: Arc<StaticSecret>,
        db: Database,
        event_sender: mpsc::UnboundedSender<MessageRecord>,
        download_dir: PathBuf,
        active_transfers: Arc<Mutex<HashMap<String, QuicFileTransferState>>>,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        // Accept concurrent bidirectional streams over this single QUIC connection
        while let Ok((mut send_stream, mut recv_stream)) = connection.accept_bi().await {
            let my_sec = Arc::clone(&my_secret);
            let db_clone = db.clone();
            let sender_clone = event_sender.clone();
            let dl_clone = download_dir.clone();
            let trans_clone = Arc::clone(&active_transfers);

            tokio::spawn(async move {
                let mut len_buf = [0u8; 4];
                if recv_stream.read_exact(&mut len_buf).await.is_ok() {
                    let packet_len = u32::from_be_bytes(len_buf) as usize;
                    if packet_len <= 64 * 1024 * 1024 {
                        let mut body_buf = vec![0u8; packet_len];
                        if recv_stream.read_exact(&mut body_buf).await.is_ok() {
                            if let Ok(packet) = bincode::deserialize::<Packet>(&body_buf) {
                                let _ = Self::process_packet(
                                    packet,
                                    my_sec,
                                    db_clone,
                                    sender_clone,
                                    dl_clone,
                                    trans_clone,
                                )
                                .await;

                                // Send ACK back over the stream
                                let ack = Packet::DeliveryAck {
                                    id: "ack-quic".to_string(),
                                };
                                if let Ok(ack_bytes) = bincode::serialize(&ack) {
                                    let len = (ack_bytes.len() as u32).to_be_bytes();
                                    let _ = send_stream.write_all(&len).await;
                                    let _ = send_stream.write_all(&ack_bytes).await;
                                }
                            }
                        }
                    }
                }
                let _ = send_stream.finish();
            });
        }

        Ok(())
    }

    async fn process_packet(
        packet: Packet,
        my_secret: Arc<StaticSecret>,
        db: Database,
        event_sender: mpsc::UnboundedSender<MessageRecord>,
        download_dir: PathBuf,
        active_transfers: Arc<Mutex<HashMap<String, QuicFileTransferState>>>,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
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

                            if let Ok(plain_bytes) = decrypt_payload(&shared, &ciphertext, &nonce) {
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
                if let Ok(Some(peer)) = db.get_peer(&sender_id) {
                    if let Ok(pubkey_bytes) = hex::decode(&peer.pubkey) {
                        if pubkey_bytes.len() == 32 {
                            let mut arr = [0u8; 32];
                            arr.copy_from_slice(&pubkey_bytes);
                            let shared = compute_shared_secret(&my_secret, &arr);

                            let safe_filename = Path::new(&file_name)
                                .file_name()
                                .and_then(|n| n.to_str())
                                .unwrap_or("received_file");
                            let out_path = download_dir.join(format!("quic_{}", safe_filename));

                            let _ = File::create(&out_path);

                            active_transfers.lock().unwrap().insert(
                                transfer_id,
                                QuicFileTransferState {
                                    file_path: out_path,
                                    total_chunks,
                                    received_chunks: 0,
                                    sender_id,
                                    file_name,
                                    file_size,
                                    is_image,
                                    shared_key: shared,
                                },
                            );
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
                let mut completed = false;
                let mut record_opt = None;

                {
                    let mut transfers = active_transfers.lock().unwrap();
                    if let Some(state) = transfers.get_mut(&transfer_id) {
                        if let Ok(plain_chunk) =
                            decrypt_payload(&state.shared_key, &ciphertext, &nonce)
                        {
                            if let Ok(mut f) = OpenOptions::new()
                                .append(true)
                                .open(&state.file_path)
                            {
                                let _ = f.write_all(&plain_chunk);
                                state.received_chunks += 1;

                                if state.received_chunks >= state.total_chunks {
                                    completed = true;
                                    let msg_record = MessageRecord {
                                        id: format!("file-{}", transfer_id),
                                        sender_id: state.sender_id.clone(),
                                        sender_name: None,
                                        recipient_id: "me".to_string(),
                                        group_id: None,
                                        content: format!(
                                            "[ไฟล์ผ่าน QUIC] {} ({} KB)",
                                            state.file_name,
                                            state.file_size / 1024
                                        ),
                                        message_type: if state.is_image {
                                            "image".to_string()
                                        } else {
                                            "file".to_string()
                                        },
                                        file_name: Some(state.file_name.clone()),
                                        file_path: Some(
                                            state.file_path.to_string_lossy().to_string(),
                                        ),
                                        file_size: Some(state.file_size),
                                        reply_to_id: None,
                                        is_mine: false,
                                        created_at: chrono::Local::now().format("%H:%M").to_string(),
                                    };
                                    record_opt = Some(msg_record);
                                }
                            }
                        }
                    }
                    if completed {
                        transfers.remove(&transfer_id);
                    }
                }

                if let Some(record) = record_opt {
                    let _ = db.save_message(&record);
                    let _ = event_sender.send(record);
                }
            }
            Packet::GroupInvite {
                group_id,
                name,
                members,
                creator_id: _,
                created_at,
            } => {
                let grp = crate::storage::GroupRecord {
                    group_id,
                    name,
                    members,
                    created_at,
                    last_message: None,
                    last_message_time: None,
                    unread_count: 0,
                };
                let _ = db.create_group(&grp);
            }
            _ => {}
        }

        Ok(())
    }
}

/// QUIC Client for high-speed multiplexed peer-to-peer transmission
pub struct QuicP2pClient;

impl QuicP2pClient {
    /// Send an encrypted text message over QUIC
    pub async fn send_text_message(
        peer_ip: &str,
        peer_port: u16,
        peer_pubkey_hex: &str,
        my_secret: &StaticSecret,
        my_id: &str,
        sender_name: Option<String>,
        group_id: Option<String>,
        msg_id: &str,
        reply_to_id: Option<String>,
        content: &str,
        created_at: &str,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let pubkey_bytes = hex::decode(peer_pubkey_hex)?;
        if pubkey_bytes.len() != 32 {
            return Err("Invalid public key length".into());
        }
        let mut target_pub = [0u8; 32];
        target_pub.copy_from_slice(&pubkey_bytes);

        let shared_key = compute_shared_secret(my_secret, &target_pub);
        let (ciphertext, nonce) = encrypt_payload(&shared_key, content.as_bytes())?;

        let packet = Packet::EncryptedMessage {
            msg_id: msg_id.to_string(),
            sender_id: my_id.to_string(),
            sender_name,
            recipient_id: "peer".to_string(),
            group_id,
            reply_to_id,
            ciphertext,
            nonce,
            created_at: created_at.to_string(),
        };

        Self::send_packet(peer_ip, peer_port, packet).await
    }

    /// Stream a file chunk-by-chunk over a dedicated QUIC stream (zero head-of-line blocking)
    pub async fn send_file(
        peer_ip: &str,
        peer_port: u16,
        peer_pubkey_hex: &str,
        my_secret: &StaticSecret,
        my_id: &str,
        transfer_id: &str,
        file_path: &Path,
        is_image: bool,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let pubkey_bytes = hex::decode(peer_pubkey_hex)?;
        if pubkey_bytes.len() != 32 {
            return Err("Invalid public key length".into());
        }
        let mut target_pub = [0u8; 32];
        target_pub.copy_from_slice(&pubkey_bytes);
        let shared_key = compute_shared_secret(my_secret, &target_pub);

        let mut file = File::open(file_path)?;
        let file_size = file.metadata()?.len();
        let file_name = file_path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("file")
            .to_string();

        let total_chunks = (file_size as f64 / CHUNK_SIZE as f64).ceil() as u64;

        // 1. Send FileTransferInit over QUIC
        let init_packet = Packet::FileTransferInit {
            transfer_id: transfer_id.to_string(),
            sender_id: my_id.to_string(),
            file_name,
            file_size,
            total_chunks,
            is_image,
        };
        Self::send_packet(peer_ip, peer_port, init_packet).await?;

        // 2. Stream all encrypted chunks over QUIC
        let mut chunk_index = 0u64;
        let mut buffer = vec![0u8; CHUNK_SIZE];

        loop {
            let bytes_read = file.read(&mut buffer)?;
            if bytes_read == 0 {
                break;
            }

            let (ciphertext, nonce) =
                encrypt_payload(&shared_key, &buffer[..bytes_read])?;
            let chunk_packet = Packet::FileChunk {
                transfer_id: transfer_id.to_string(),
                chunk_index,
                ciphertext,
                nonce,
            };

            Self::send_packet(peer_ip, peer_port, chunk_packet).await?;
            chunk_index += 1;
        }

        Ok(())
    }

    /// Generic packet transmitter over QUIC
    pub async fn send_packet(
        peer_ip: &str,
        peer_port: u16,
        packet: Packet,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let client_config = create_quic_client_config()?;
        let bind_addr = SocketAddr::from(([0, 0, 0, 0], 0));
        let mut endpoint = Endpoint::client(bind_addr)?;
        endpoint.set_default_client_config(client_config);

        let target_addr: SocketAddr = format!("{}:{}", peer_ip, peer_port).parse()?;
        let connection = endpoint.connect(target_addr, "craft-chat.local")?.await?;

        let (mut send_stream, mut recv_stream) = connection.open_bi().await?;

        let encoded = bincode::serialize(&packet)?;
        let len_bytes = (encoded.len() as u32).to_be_bytes();

        send_stream.write_all(&len_bytes).await?;
        send_stream.write_all(&encoded).await?;
        send_stream.finish()?;

        // Wait for server ACK
        let mut ack_len_buf = [0u8; 4];
        let _ = recv_stream.read_exact(&mut ack_len_buf).await;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_quic_cert_and_configs() {
        let (certs, key) = generate_self_signed_cert().expect("generate cert failed");
        assert!(!certs.is_empty());
        let server_cfg = create_quic_server_config(certs, key).expect("server config failed");
        let client_cfg = create_quic_client_config().expect("client config failed");
        let _ = (server_cfg, client_cfg);
    }

    #[tokio::test]
    async fn test_quic_end_to_end_transmission() {
        let (tx, mut rx) = mpsc::unbounded_channel();
        let db = Database::init(":memory:").expect("db init");

        let node_a_secret = StaticSecret::random_from_rng(rand::rngs::OsRng);
        let node_b_secret = StaticSecret::random_from_rng(rand::rngs::OsRng);
        let node_b_pub = x25519_dalek::PublicKey::from(&node_b_secret);
        let node_a_pub = x25519_dalek::PublicKey::from(&node_a_secret);

        // Save Node A in Node B's db
        db.upsert_peer(
            "node-a",
            "Node A",
            "127.0.0.1",
            0,
            &hex::encode(node_a_pub.as_bytes()),
        )
        .expect("upsert peer");

        let server = QuicP2pServer::new(
            0, // Ephemeral port
            node_b_secret,
            db.clone(),
            PathBuf::from("/tmp"),
            tx,
        );

        let bound_addr = server.start().await.expect("start server");
        let server_port = bound_addr.port();

        // Node A sends message over QUIC to Node B
        QuicP2pClient::send_text_message(
            "127.0.0.1",
            server_port,
            &hex::encode(node_b_pub.as_bytes()),
            &node_a_secret,
            "node-a",
            Some("Node A".to_string()),
            None,
            "msg-quic-123",
            None,
            "Hello from QUIC 0-RTT Multiplexed Stream!",
            "12:00",
        )
        .await
        .expect("send text message over quic");

        // Verify Node B received the decrypted message!
        let received = tokio::time::timeout(std::time::Duration::from_secs(3), rx.recv())
            .await
            .expect("timeout")
            .expect("received message");

        assert_eq!(received.id, "msg-quic-123");
        assert_eq!(received.sender_id, "node-a");
        assert_eq!(received.content, "Hello from QUIC 0-RTT Multiplexed Stream!");
    }
}
