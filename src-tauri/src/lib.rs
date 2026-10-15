use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use tauri::Manager;

pub mod commands;
pub mod crypto;
pub mod network;
pub mod storage;

use commands::*;
use crypto::KeyPair;
use network::{DiscoveryManager, TcpP2pServer};
use storage::Database;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle();

            // 1. Setup App Data Directory and SQLite DB
            let app_data_dir = dirs::data_local_dir()
                .unwrap_or_else(|| PathBuf::from("."))
                .join("craft-chat");
            std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data directory");

            let db_path = app_data_dir.join("chat.db");
            let db = Database::init(db_path).expect("Failed to initialize SQLite database");

            let download_dir = dirs::download_dir()
                .unwrap_or_else(|| app_data_dir.join("downloads"))
                .join("CraftChat");
            std::fs::create_dir_all(&download_dir).expect("Failed to create download directory");

            // 2. Setup or Load Identity & Cryptographic Keys
            let keypair = match db.get_setting("secret_key") {
                Ok(Some(hex_secret)) => {
                    let bytes = hex::decode(hex_secret).unwrap_or_default();
                    if bytes.len() == 32 {
                        let mut arr = [0u8; 32];
                        arr.copy_from_slice(&bytes);
                        KeyPair::from_bytes(arr)
                    } else {
                        KeyPair::generate()
                    }
                }
                _ => {
                    let kp = KeyPair::generate();
                    let _ = db.set_setting("secret_key", &hex::encode(kp.secret.to_bytes()));
                    kp
                }
            };

            let my_peer_id = match db.get_setting("peer_id") {
                Ok(Some(id)) => id,
                _ => {
                    let id = format!("node-{}", &keypair.public_hex()[..8]);
                    let _ = db.set_setting("peer_id", &id);
                    id
                }
            };

            let default_name = format!("Host-{}", &my_peer_id[my_peer_id.len().saturating_sub(4)..]);
            let my_display_name = db.get_setting("display_name").unwrap_or(None).unwrap_or(default_name);
            let my_port: u16 = db
                .get_setting("port")
                .ok()
                .flatten()
                .and_then(|p| p.parse().ok())
                .unwrap_or(4242);

            let my_pubkey_hex = keypair.public_hex();
            let my_secret = Arc::new(keypair.secret);

            let my_status_text = db.get_setting("status_text").unwrap_or(None).unwrap_or_else(|| "Online พร้อมคุย".to_string());
            let my_status_sticker = db.get_setting("status_sticker").unwrap_or(None).unwrap_or_else(|| "fl_6028690".to_string());
            let my_avatar_url = db.get_setting("avatar_url").unwrap_or(None).unwrap_or_default();
            let my_chat_background = db.get_setting("chat_background").unwrap_or(None).unwrap_or_default();

            // 3.1 Start Inbound TCP P2P Server (for legacy fallback)
            let server = TcpP2pServer::new(
                my_port,
                (*my_secret).clone(),
                db.clone(),
                download_dir.clone(),
                handle.clone(),
            );
            tauri::async_runtime::spawn(async move {
                if let Err(e) = server.start().await {
                    eprintln!("❌ P2P TCP Server failed to start: {:?}", e);
                }
            });

            // 3.2 Start Inbound QUIC UDP Server (High-Speed 0-RTT Multiplexing)
            let (quic_event_tx, mut quic_event_rx) = tokio::sync::mpsc::unbounded_channel();
            let quic_server = craft_chat_core::quic::QuicP2pServer::new(
                my_port,
                (*my_secret).clone(),
                db.clone(),
                download_dir.clone(),
                quic_event_tx,
            );
            tauri::async_runtime::spawn(async move {
                if let Err(e) = quic_server.start().await {
                    eprintln!("❌ P2P QUIC Server failed to start: {:?}", e);
                }
            });

            let quic_handle = handle.clone();
            tauri::async_runtime::spawn(async move {
                while let Some(msg) = quic_event_rx.recv().await {
                    let _ = quic_handle.emit("new-message", msg);
                }
            });

            // 3.3 Initialize Bluetooth Proximity Engine (Offline P2P when no internet/LAN)
            let (bt_event_tx, mut bt_event_rx) = tokio::sync::mpsc::unbounded_channel();
            let bt_manager = Arc::new(craft_chat_core::bluetooth::BluetoothManager::new(
                my_peer_id.clone(),
                Arc::new(Mutex::new(my_display_name.clone())),
                my_pubkey_hex.clone(),
                my_secret.clone(),
                db.clone(),
                bt_event_tx,
            ));

            let bt_handle = handle.clone();
            tauri::async_runtime::spawn(async move {
                while let Some(msg) = bt_event_rx.recv().await {
                    let _ = bt_handle.emit("new-message", msg);
                }
            });

            // 4. Start mDNS Auto-Discovery
            if let Ok(mut discovery) = DiscoveryManager::new() {
                let _ = discovery.register(&my_peer_id, &my_display_name, my_port, &my_pubkey_hex);
                let _ = discovery.start_browsing(handle.clone(), db.clone(), my_peer_id.clone());
            }

            // 5. Store App State for Tauri IPC Commands
            app.manage(AppState {
                db,
                my_peer_id,
                my_display_name: Arc::new(Mutex::new(my_display_name)),
                my_port: Arc::new(Mutex::new(my_port)),
                my_secret,
                my_pubkey_hex,
                download_dir: Arc::new(Mutex::new(download_dir)),
                my_status_text: Arc::new(Mutex::new(my_status_text)),
                my_status_sticker: Arc::new(Mutex::new(my_status_sticker)),
                my_avatar_url: Arc::new(Mutex::new(my_avatar_url)),
                my_chat_background: Arc::new(Mutex::new(my_chat_background)),
                bt_manager: bt_manager.clone(),
            });

            println!("✨ CraftChat Core (QUIC + Bluetooth) Initialized Successfully");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_my_profile,
            update_profile,
            update_user_status,
            update_avatar,
            update_chat_background,
            get_peers,
            get_messages,
            get_groups,
            create_group,
            get_group_messages,
            send_message,
            send_file,
            open_file_location,
            refresh_discovery,
            send_call_signal,
            start_bluetooth_scan,
            get_bluetooth_status,
            get_discovered_bt_peers,
            get_network_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
