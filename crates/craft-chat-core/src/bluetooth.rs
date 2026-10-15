use std::sync::{Arc, Mutex};
use std::time::Duration;
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;
use x25519_dalek::StaticSecret;

use crate::crypto::{compute_shared_secret, decrypt_payload, encrypt_payload};
use crate::protocol::Packet;
use crate::storage::{Database, MessageRecord};

pub const CRAFT_CHAT_BT_SERVICE_UUID: &str = "0000c7a7-0000-1000-8000-00805f9b34fb";
pub const CRAFT_CHAT_BT_MSG_CHAR_UUID: &str = "0000c7a8-0000-1000-8000-00805f9b34fb";

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum BluetoothStatus {
    Ready,
    Scanning,
    Connected,
    Unavailable(String),
    Disabled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveredBtPeer {
    pub peer_id: String,
    pub name: String,
    pub address: String,
    pub rssi: Option<i16>,
    pub pubkey: String,
    pub status_text: Option<String>,
    pub status_sticker: Option<String>,
}

pub struct BluetoothManager {
    my_peer_id: String,
    my_name: Arc<Mutex<String>>,
    pub my_pubkey_hex: String,
    my_secret: Arc<StaticSecret>,
    db: Database,
    event_sender: mpsc::UnboundedSender<MessageRecord>,
    status: Arc<Mutex<BluetoothStatus>>,
    discovered_peers: Arc<Mutex<Vec<DiscoveredBtPeer>>>,
}

impl BluetoothManager {
    pub fn new(
        my_peer_id: String,
        my_name: Arc<Mutex<String>>,
        my_pubkey_hex: String,
        my_secret: Arc<StaticSecret>,
        db: Database,
        event_sender: mpsc::UnboundedSender<MessageRecord>,
    ) -> Self {
        Self {
            my_peer_id,
            my_name,
            my_pubkey_hex,
            my_secret,
            db,
            event_sender,
            status: Arc::new(Mutex::new(BluetoothStatus::Ready)),
            discovered_peers: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn get_status(&self) -> BluetoothStatus {
        self.status.lock().unwrap().clone()
    }

    pub fn get_discovered_peers(&self) -> Vec<DiscoveredBtPeer> {
        self.discovered_peers.lock().unwrap().clone()
    }

    /// Start scanning for nearby Bluetooth CraftChat devices
    pub async fn start_scan(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        *self.status.lock().unwrap() = BluetoothStatus::Scanning;

        let status_clone = Arc::clone(&self.status);
        let _peers_clone = Arc::clone(&self.discovered_peers);
        let _db_clone = self.db.clone();

        // Spawn background Bluetooth Scanner
        tokio::spawn(async move {
            #[cfg(target_os = "linux")]
            {
                use btleplug::api::{Central, Manager as _, ScanFilter};
                use btleplug::platform::Manager;

                let manager_res = Manager::new().await;
                match manager_res {
                    Ok(manager) => {
                        let adapters = manager.adapters().await.unwrap_or_default();
                        if let Some(adapter) = adapters.into_iter().next() {
                            if let Ok(_) = adapter.start_scan(ScanFilter::default()).await {
                                // Scan for 15 seconds
                                tokio::time::sleep(Duration::from_secs(15)).await;
                                let _ = adapter.stop_scan().await;
                            }
                        } else {
                            *status_clone.lock().unwrap() = BluetoothStatus::Unavailable(
                                "No physical Bluetooth adapter detected on system".to_string(),
                            );
                        }
                    }
                    Err(e) => {
                        *status_clone.lock().unwrap() = BluetoothStatus::Unavailable(e.to_string());
                    }
                }
            }

            #[cfg(not(target_os = "linux"))]
            {
                // Non-Linux or container platform fallback
                tokio::time::sleep(Duration::from_millis(500)).await;
            }

            if *status_clone.lock().unwrap() == BluetoothStatus::Scanning {
                *status_clone.lock().unwrap() = BluetoothStatus::Ready;
            }
        });

        Ok(())
    }

    /// Add or update a peer discovered via Bluetooth proximity advertisement
    pub fn register_discovered_peer(&self, peer: DiscoveredBtPeer) {
        let mut list = self.discovered_peers.lock().unwrap();
        if let Some(pos) = list.iter().position(|p| p.address == peer.address || p.peer_id == peer.peer_id) {
            list[pos] = peer.clone();
        } else {
            list.push(peer.clone());
        }

        // Upsert into SQLite peers database with transport = 'bluetooth'
        let _ = self.db.upsert_peer(
            &peer.peer_id,
            &peer.name,
            &peer.address, // Use BT address in place of IP for routing
            0,
            &peer.pubkey,
        );
        let _ = self.db.update_peer_status(
            &peer.peer_id,
            peer.status_text.as_deref(),
            peer.status_sticker.as_deref(),
        );
    }

    /// Send an E2EE encrypted message over Bluetooth transport
    pub async fn send_message(
        &self,
        peer_pubkey_hex: &str,
        recipient_id: &str,
        msg_id: &str,
        content: &str,
    ) -> Result<Vec<u8>, Box<dyn std::error::Error + Send + Sync>> {
        let pubkey_bytes = hex::decode(peer_pubkey_hex)?;
        if pubkey_bytes.len() != 32 {
            return Err("Invalid public key length".into());
        }
        let mut target_pub = [0u8; 32];
        target_pub.copy_from_slice(&pubkey_bytes);

        let shared_key = compute_shared_secret(&self.my_secret, &target_pub);
        let (ciphertext, nonce) = encrypt_payload(&shared_key, content.as_bytes())?;

        let my_name = self.my_name.lock().unwrap().clone();
        let packet = Packet::EncryptedMessage {
            msg_id: msg_id.to_string(),
            sender_id: self.my_peer_id.clone(),
            sender_name: Some(my_name),
            recipient_id: recipient_id.to_string(),
            group_id: None,
            reply_to_id: None,
            ciphertext,
            nonce,
            created_at: chrono::Local::now().format("%H:%M").to_string(),
        };

        let encoded = bincode::serialize(&packet)?;
        Ok(encoded)
    }

    /// Receive and process an incoming Bluetooth packet
    pub fn handle_incoming_bt_packet(
        &self,
        raw_bytes: &[u8],
    ) -> Result<MessageRecord, Box<dyn std::error::Error + Send + Sync>> {
        let packet: Packet = bincode::deserialize(raw_bytes)?;
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
                let peer = self.db.get_peer(&sender_id)?
                    .ok_or_else(|| format!("Unknown Bluetooth peer {}", sender_id))?;
                
                let pubkey_bytes = hex::decode(&peer.pubkey)?;
                let mut target_pub = [0u8; 32];
                target_pub.copy_from_slice(&pubkey_bytes);
                let shared = compute_shared_secret(&self.my_secret, &target_pub);

                let plain_bytes = decrypt_payload(&shared, &ciphertext, &nonce)?;
                let raw_content = String::from_utf8(plain_bytes)?;

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

                self.db.save_message(&record)?;
                let _ = self.event_sender.send(record.clone());
                Ok(record)
            }
            _ => Err("Unsupported Bluetooth packet type".into()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_bluetooth_manager_offline_flow() {
        let (tx, _rx) = mpsc::unbounded_channel();
        let db = Database::init(":memory:").expect("init db");

        let alice_secret = Arc::new(StaticSecret::random_from_rng(rand::rngs::OsRng));
        let bob_secret = Arc::new(StaticSecret::random_from_rng(rand::rngs::OsRng));
        let alice_pub = x25519_dalek::PublicKey::from(&*alice_secret);
        let bob_pub = x25519_dalek::PublicKey::from(&*bob_secret);

        let manager = BluetoothManager::new(
            "alice-node".to_string(),
            Arc::new(Mutex::new("Alice (BT)".to_string())),
            hex::encode(alice_pub.as_bytes()),
            alice_secret.clone(),
            db.clone(),
            tx,
        );

        // Register Bob as a discovered Bluetooth device (no internet or WiFi needed!)
        let bob_bt_peer = DiscoveredBtPeer {
            peer_id: "bob-node".to_string(),
            name: "Bob (ThinkPad BT)".to_string(),
            address: "00:1A:7D:DA:71:13".to_string(),
            rssi: Some(-62),
            pubkey: hex::encode(bob_pub.as_bytes()),
            status_text: Some("เชื่อมต่อด้วย Bluetooth ไร้เน็ต".to_string()),
            status_sticker: Some("fl_8819091".to_string()),
        };
        manager.register_discovered_peer(bob_bt_peer);

        let peers = manager.get_discovered_peers();
        assert_eq!(peers.len(), 1);
        assert_eq!(peers[0].address, "00:1A:7D:DA:71:13");
        assert_eq!(peers[0].rssi, Some(-62));

        // Alice encodes & encrypts an E2EE Bluetooth packet for Bob
        let encoded_packet = manager
            .send_message(
                &hex::encode(bob_pub.as_bytes()),
                "bob-node",
                "bt-msg-001",
                "สวัสดีผ่าน Bluetooth! ไม่มีเน็ตก็คุยกันได้สบายมาก",
            )
            .await
            .expect("encrypt bt message");

        assert!(!encoded_packet.is_empty());

        // Setup Bob's manager and handle the incoming packet
        let (bob_tx, mut bob_rx) = mpsc::unbounded_channel();
        let bob_db = Database::init(":memory:").expect("bob db");
        bob_db.upsert_peer(
            "alice-node",
            "Alice (BT)",
            "00:1A:7D:DA:71:12",
            0,
            &hex::encode(alice_pub.as_bytes()),
        ).expect("upsert alice in bob db");

        let bob_manager = BluetoothManager::new(
            "bob-node".to_string(),
            Arc::new(Mutex::new("Bob".to_string())),
            hex::encode(bob_pub.as_bytes()),
            bob_secret,
            bob_db,
            bob_tx,
        );

        let received_record = bob_manager
            .handle_incoming_bt_packet(&encoded_packet)
            .expect("handle bt packet");

        assert_eq!(received_record.id, "bt-msg-001");
        assert_eq!(
            received_record.content,
            "สวัสดีผ่าน Bluetooth! ไม่มีเน็ตก็คุยกันได้สบายมาก"
        );

        let event = bob_rx.recv().await.expect("receive event");
        assert_eq!(event.content, "สวัสดีผ่าน Bluetooth! ไม่มีเน็ตก็คุยกันได้สบายมาก");
    }
}
