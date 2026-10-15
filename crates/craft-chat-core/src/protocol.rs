use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum Packet {
    Handshake {
        sender_id: String,
        sender_name: String,
        sender_pubkey: String,
    },
    EncryptedMessage {
        msg_id: String,
        sender_id: String,
        sender_name: Option<String>,
        recipient_id: String,
        group_id: Option<String>,
        reply_to_id: Option<String>,
        ciphertext: Vec<u8>,
        nonce: [u8; 24],
        created_at: String,
    },
    FileTransferInit {
        transfer_id: String,
        sender_id: String,
        file_name: String,
        file_size: u64,
        total_chunks: u64,
        is_image: bool,
    },
    FileChunk {
        transfer_id: String,
        chunk_index: u64,
        ciphertext: Vec<u8>,
        nonce: [u8; 24],
    },
    DeliveryAck {
        id: String,
    },
    CallSignal {
        call_id: String,
        sender_id: String,
        signal_type: String, // "offer" | "answer" | "candidate" | "hangup" | "reject"
        payload: String,
    },
    GroupInvite {
        group_id: String,
        name: String,
        members: Vec<String>,
        creator_id: String,
        created_at: String,
    },
}
