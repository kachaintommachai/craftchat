use std::fs::File;
use std::io::Read;
use std::path::Path;
use tokio::io::AsyncWriteExt;
use tokio::net::TcpStream;
use x25519_dalek::StaticSecret;

use crate::crypto::{compute_shared_secret, encrypt_payload};
use crate::protocol::Packet;

const CHUNK_SIZE: usize = 64 * 1024;

pub struct TcpP2pClient;

impl TcpP2pClient {
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

        let encoded = bincode::serialize(&packet)?;
        let len_bytes = (encoded.len() as u32).to_be_bytes();

        let mut stream = TcpStream::connect(format!("{}:{}", peer_ip, peer_port)).await?;
        stream.write_all(&len_bytes).await?;
        stream.write_all(&encoded).await?;
        stream.flush().await?;

        Ok(())
    }

    pub async fn send_group_invite(
        peer_ip: &str,
        peer_port: u16,
        group_id: &str,
        name: &str,
        members: Vec<String>,
        creator_id: &str,
        created_at: &str,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let packet = Packet::GroupInvite {
            group_id: group_id.to_string(),
            name: name.to_string(),
            members,
            creator_id: creator_id.to_string(),
            created_at: created_at.to_string(),
        };

        let encoded = bincode::serialize(&packet)?;
        let len_bytes = (encoded.len() as u32).to_be_bytes();

        let mut stream = TcpStream::connect(format!("{}:{}", peer_ip, peer_port)).await?;
        stream.write_all(&len_bytes).await?;
        stream.write_all(&encoded).await?;
        stream.flush().await?;

        Ok(())
    }

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
        let mut target_pub = [0u8; 32];
        target_pub.copy_from_slice(&pubkey_bytes);
        let shared_key = compute_shared_secret(my_secret, &target_pub);

        let mut file = File::open(file_path)?;
        let metadata = file.metadata()?;
        let file_size = metadata.len();
        let total_chunks = (file_size + CHUNK_SIZE as u64 - 1) / CHUNK_SIZE as u64;

        let file_name = file_path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("file")
            .to_string();

        let mut stream = TcpStream::connect(format!("{}:{}", peer_ip, peer_port)).await?;

        let init_packet = Packet::FileTransferInit {
            transfer_id: transfer_id.to_string(),
            sender_id: my_id.to_string(),
            file_name,
            file_size,
            total_chunks,
            is_image,
        };
        let init_bytes = bincode::serialize(&init_packet)?;
        stream.write_all(&(init_bytes.len() as u32).to_be_bytes()).await?;
        stream.write_all(&init_bytes).await?;

        let mut buffer = vec![0u8; CHUNK_SIZE];
        let mut chunk_index = 0u64;

        loop {
            let bytes_read = file.read(&mut buffer)?;
            if bytes_read == 0 {
                break;
            }

            let (ciphertext, nonce) = encrypt_payload(&shared_key, &buffer[..bytes_read])?;
            let chunk_packet = Packet::FileChunk {
                transfer_id: transfer_id.to_string(),
                chunk_index,
                ciphertext,
                nonce,
            };

            let chunk_bytes = bincode::serialize(&chunk_packet)?;
            stream.write_all(&(chunk_bytes.len() as u32).to_be_bytes()).await?;
            stream.write_all(&chunk_bytes).await?;

            chunk_index += 1;
        }

        stream.flush().await?;
        Ok(())
    }

    pub async fn send_call_signal(
        peer_ip: &str,
        peer_port: u16,
        call_id: &str,
        my_id: &str,
        signal_type: &str,
        payload: &str,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let packet = Packet::CallSignal {
            call_id: call_id.to_string(),
            sender_id: my_id.to_string(),
            signal_type: signal_type.to_string(),
            payload: payload.to_string(),
        };

        let encoded = bincode::serialize(&packet)?;
        let len_bytes = (encoded.len() as u32).to_be_bytes();

        let mut stream = TcpStream::connect(format!("{}:{}", peer_ip, peer_port)).await?;
        stream.write_all(&len_bytes).await?;
        stream.write_all(&encoded).await?;
        stream.flush().await?;

        Ok(())
    }
}
