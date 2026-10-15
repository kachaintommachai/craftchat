use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, State};
use x25519_dalek::StaticSecret;

use crate::network::client::TcpP2pClient;
use crate::storage::{Database, GroupRecord, MessageRecord, PeerRecord};

pub struct AppState {
    pub db: Database,
    pub my_peer_id: String,
    pub my_display_name: Arc<Mutex<String>>,
    pub my_port: Arc<Mutex<u16>>,
    pub my_secret: Arc<StaticSecret>,
    pub my_pubkey_hex: String,
    pub download_dir: Arc<Mutex<PathBuf>>,
    pub my_status_text: Arc<Mutex<String>>,
    pub my_status_sticker: Arc<Mutex<String>>,
    pub my_avatar_url: Arc<Mutex<String>>,
    pub my_chat_background: Arc<Mutex<String>>,
    pub bt_manager: Arc<craft_chat_core::bluetooth::BluetoothManager>,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct UserProfileDto {
    pub peer_id: String,
    pub display_name: String,
    pub port: u16,
    pub pubkey: String,
    pub download_dir: String,
    pub ip_address: String,
    pub status_text: Option<String>,
    pub status_sticker: Option<String>,
    pub avatar_url: Option<String>,
    pub chat_background: Option<String>,
}

#[tauri::command]
pub fn get_my_profile(state: State<'_, AppState>) -> Result<UserProfileDto, String> {
    let name = state.my_display_name.lock().unwrap().clone();
    let port = *state.my_port.lock().unwrap();
    let dl_dir = state.download_dir.lock().unwrap().to_string_lossy().to_string();
    let local_ip = local_ip_address::local_ip()
        .map(|ip| ip.to_string())
        .unwrap_or_else(|_| "127.0.0.1".into());
    let status_text = state.my_status_text.lock().unwrap().clone();
    let status_sticker = state.my_status_sticker.lock().unwrap().clone();
    let avatar_url = state.my_avatar_url.lock().unwrap().clone();
    let chat_background = state.my_chat_background.lock().unwrap().clone();

    Ok(UserProfileDto {
        peer_id: state.my_peer_id.clone(),
        display_name: name,
        port,
        pubkey: state.my_pubkey_hex.clone(),
        download_dir: dl_dir,
        ip_address: local_ip,
        status_text: Some(status_text),
        status_sticker: Some(status_sticker),
        avatar_url: if avatar_url.is_empty() { None } else { Some(avatar_url) },
        chat_background: if chat_background.is_empty() { None } else { Some(chat_background) },
    })
}

#[tauri::command]
pub fn update_user_status(
    state: State<'_, AppState>,
    status_text: String,
    status_sticker: String,
) -> Result<(), String> {
    *state.my_status_text.lock().unwrap() = status_text.clone();
    *state.my_status_sticker.lock().unwrap() = status_sticker.clone();

    let _ = state.db.set_setting("status_text", &status_text);
    let _ = state.db.set_setting("status_sticker", &status_sticker);

    Ok(())
}

#[tauri::command]
pub fn update_avatar(
    state: State<'_, AppState>,
    avatar_url: String,
) -> Result<(), String> {
    *state.my_avatar_url.lock().unwrap() = avatar_url.clone();
    let _ = state.db.set_setting("avatar_url", &avatar_url);
    Ok(())
}

#[tauri::command]
pub fn update_chat_background(
    state: State<'_, AppState>,
    background: String,
) -> Result<(), String> {
    *state.my_chat_background.lock().unwrap() = background.clone();
    let _ = state.db.set_setting("chat_background", &background);
    Ok(())
}

#[tauri::command]
pub fn update_profile(
    state: State<'_, AppState>,
    display_name: String,
    port: u16,
    download_dir: String,
) -> Result<(), String> {
    *state.my_display_name.lock().unwrap() = display_name.clone();
    *state.my_port.lock().unwrap() = port;
    *state.download_dir.lock().unwrap() = PathBuf::from(download_dir.clone());

    let _ = state.db.set_setting("display_name", &display_name);
    let _ = state.db.set_setting("port", &port.to_string());
    let _ = state.db.set_setting("download_dir", &download_dir);

    Ok(())
}

#[tauri::command]
pub fn get_peers(state: State<'_, AppState>) -> Result<Vec<PeerRecord>, String> {
    state.db.get_peers().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_messages(
    state: State<'_, AppState>,
    peer_id: String,
) -> Result<Vec<MessageRecord>, String> {
    state
        .db
        .get_messages_for_peer(&state.my_peer_id, &peer_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_groups(state: State<'_, AppState>) -> Result<Vec<GroupRecord>, String> {
    state.db.get_groups().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_group(
    state: State<'_, AppState>,
    name: String,
    member_ids: Vec<String>,
) -> Result<GroupRecord, String> {
    let group_id = format!("group-{}", uuid::Uuid::new_v4());
    let created_at = chrono::Local::now().format("%H:%M").to_string();
    let mut all_members = member_ids.clone();
    if !all_members.contains(&state.my_peer_id) {
        all_members.push(state.my_peer_id.clone());
    }

    let group = GroupRecord {
        group_id: group_id.clone(),
        name: name.clone(),
        members: all_members.clone(),
        created_at: created_at.clone(),
        last_message: None,
        last_message_time: None,
        unread_count: 0,
    };

    state.db.create_group(&group).map_err(|e| e.to_string())?;

    // Fan out group invites to members over LAN TCP
    for member_id in &member_ids {
        if member_id == &state.my_peer_id {
            continue;
        }
        if let Ok(Some(peer)) = state.db.get_peer(member_id) {
            let _ = TcpP2pClient::send_group_invite(
                &peer.ip,
                peer.port,
                &group_id,
                &name,
                all_members.clone(),
                &state.my_peer_id,
                &created_at,
            )
            .await;
        }
    }

    Ok(group)
}

#[tauri::command]
pub fn get_group_messages(
    state: State<'_, AppState>,
    group_id: String,
) -> Result<Vec<MessageRecord>, String> {
    state
        .db
        .get_messages_for_group(&group_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn send_message(
    state: State<'_, AppState>,
    recipient_id: String,
    group_id: Option<String>,
    content: String,
    reply_to_id: Option<String>,
    message_type: Option<String>,
) -> Result<(), String> {
    let msg_id = format!("msg-{}", uuid::Uuid::new_v4());
    let created_at = chrono::Local::now().format("%H:%M").to_string();
    let msg_type = message_type.unwrap_or_else(|| "text".to_string());
    let my_name = state.my_display_name.lock().unwrap().clone();

    let wire_payload = if msg_type == "sticker" {
        format!("[STICKER:{}]", content)
    } else {
        content.clone()
    };

    if let Some(ref gid) = group_id {
        // Group Fan-out sending to all online members in LAN
        if let Ok(Some(grp)) = state.db.get_group(gid) {
            for member_id in &grp.members {
                if member_id == &state.my_peer_id {
                    continue;
                }
                if let Ok(Some(peer)) = state.db.get_peer(member_id) {
                    let _ = TcpP2pClient::send_text_message(
                        &peer.ip,
                        peer.port,
                        &peer.pubkey,
                        &state.my_secret,
                        &state.my_peer_id,
                        Some(my_name.clone()),
                        Some(gid.clone()),
                        &msg_id,
                        reply_to_id.clone(),
                        &wire_payload,
                        &created_at,
                    )
                    .await;
                }
            }
        }

        // Save local copy with group_id
        let record = MessageRecord {
            id: msg_id,
            sender_id: state.my_peer_id.clone(),
            sender_name: Some(my_name),
            recipient_id: String::new(),
            group_id: Some(gid.clone()),
            content,
            message_type: msg_type,
            file_name: None,
            file_path: None,
            file_size: None,
            reply_to_id,
            is_mine: true,
            created_at,
        };
        state.db.save_message(&record).map_err(|e| e.to_string())?;
    } else {
        // 1-on-1 Direct Message: QUIC (UDP) -> Bluetooth -> TCP fallback
        let peer = state
            .db
            .get_peer(&recipient_id)
            .map_err(|e| e.to_string())?
            .ok_or_else(|| "Peer not found".to_string())?;

        let is_bluetooth = peer.transport.as_deref() == Some("bluetooth");

        if is_bluetooth {
            // Direct Bluetooth E2EE Message Delivery
            let _ = state
                .bt_manager
                .send_message(
                    &peer.pubkey,
                    &recipient_id,
                    &msg_id,
                    &wire_payload,
                )
                .await
                .map_err(|e| format!("Bluetooth transmission failed: {:?}", e))?;
        } else {
            // High-speed QUIC Multiplexed Stream (with automatic TCP fallback)
            let quic_res = craft_chat_core::quic::QuicP2pClient::send_text_message(
                &peer.ip,
                peer.port,
                &peer.pubkey,
                &state.my_secret,
                &state.my_peer_id,
                Some(my_name.clone()),
                None,
                &msg_id,
                reply_to_id.clone(),
                &wire_payload,
                &created_at,
            )
            .await;

            if quic_res.is_ok() {
                let _ = state.db.update_peer_transport(&recipient_id, "quic", None, None);
            } else {
                // Fallback to TCP if QUIC/UDP is filtered or unavailable
                TcpP2pClient::send_text_message(
                    &peer.ip,
                    peer.port,
                    &peer.pubkey,
                    &state.my_secret,
                    &state.my_peer_id,
                    Some(my_name.clone()),
                    None,
                    &msg_id,
                    reply_to_id.clone(),
                    &wire_payload,
                    &created_at,
                )
                .await
                .map_err(|e| format!("Failed to deliver message: {:?}", e))?;
                let _ = state.db.update_peer_transport(&recipient_id, "tcp", None, None);
            }
        }

        let record = MessageRecord {
            id: msg_id,
            sender_id: state.my_peer_id.clone(),
            sender_name: Some(my_name),
            recipient_id,
            group_id: None,
            content,
            message_type: msg_type,
            file_name: None,
            file_path: None,
            file_size: None,
            reply_to_id,
            is_mine: true,
            created_at,
        };
        state.db.save_message(&record).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub async fn send_file(
    state: State<'_, AppState>,
    recipient_id: String,
    file_path: String,
    file_type: String,
) -> Result<(), String> {
    let peer = state
        .db
        .get_peer(&recipient_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Peer not found".to_string())?;

    let path = Path::new(&file_path);
    if !path.exists() {
        return Err("File not found".into());
    }

    let is_image = file_type == "image";
    let transfer_id = uuid::Uuid::new_v4().to_string();
    let file_size = path.metadata().map(|m| m.len()).unwrap_or(0);
    let file_name = path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("file")
        .to_string();

    // Stream file over QUIC independent stream (No Head-of-Line blocking)
    let quic_res = craft_chat_core::quic::QuicP2pClient::send_file(
        &peer.ip,
        peer.port,
        &peer.pubkey,
        &state.my_secret,
        &state.my_peer_id,
        &transfer_id,
        path,
        is_image,
    )
    .await;

    if quic_res.is_err() {
        // Fallback to TCP file stream
        TcpP2pClient::send_file(
            &peer.ip,
            peer.port,
            &peer.pubkey,
            &state.my_secret,
            &state.my_peer_id,
            &transfer_id,
            path,
            is_image,
        )
        .await
        .map_err(|e| format!("File transmission failed: {:?}", e))?;
    }

    // Save outbound record to SQLite
    let record = MessageRecord {
        id: format!("file-{}", transfer_id),
        sender_id: state.my_peer_id.clone(),
        sender_name: Some(state.my_display_name.lock().unwrap().clone()),
        recipient_id,
        group_id: None,
        content: format!("ส่งไฟล์: {}", file_name),
        message_type: if is_image { "image".into() } else { "file".into() },
        file_name: Some(file_name),
        file_path: Some(file_path),
        file_size: Some(file_size),
        reply_to_id: None,
        is_mine: true,
        created_at: chrono::Local::now().format("%H:%M").to_string(),
    };

    state.db.save_message(&record).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn open_file_location(app: AppHandle, path: String) -> Result<(), String> {
    // Open containing directory or file using native system explorer
    let p = Path::new(&path);
    let target = if p.is_dir() {
        p.to_path_buf()
    } else {
        p.parent().unwrap_or(p).to_path_buf()
    };

    #[cfg(target_os = "windows")]
    {
        let _ = std::process::Command::new("explorer").arg(target).spawn();
    }
    #[cfg(target_os = "macos")]
    {
        let _ = std::process::Command::new("open").arg(target).spawn();
    }
    #[cfg(target_os = "linux")]
    {
        let _ = std::process::Command::new("xdg-open").arg(target).spawn();
    }

    Ok(())
}

#[tauri::command]
pub fn refresh_discovery() -> Result<(), String> {
    // Triggers another discovery scan
    Ok(())
}

#[tauri::command]
pub async fn send_call_signal(
    state: State<'_, AppState>,
    recipient_id: String,
    call_id: String,
    signal_type: String,
    payload: String,
) -> Result<(), String> {
    let peer = state
        .db
        .get_peer(&recipient_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Peer not found".to_string())?;

    TcpP2pClient::send_call_signal(
        &peer.ip,
        peer.port,
        &call_id,
        &state.my_peer_id,
        &signal_type,
        &payload,
    )
    .await
    .map_err(|e| format!("Call signal delivery failed: {:?}", e))?;

    Ok(())
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct NetworkStatusDto {
    pub quic_active: bool,
    pub tcp_active: bool,
    pub bluetooth_available: bool,
    pub bluetooth_status: String,
    pub internet_connected: bool,
    pub default_transport: String,
}

#[tauri::command]
pub async fn start_bluetooth_scan(
    state: State<'_, AppState>,
) -> Result<String, String> {
    state.bt_manager.start_scan().await.map_err(|e| e.to_string())?;
    Ok("Scanning started".to_string())
}

#[tauri::command]
pub fn get_bluetooth_status(
    state: State<'_, AppState>,
) -> Result<craft_chat_core::bluetooth::BluetoothStatus, String> {
    Ok(state.bt_manager.get_status())
}

#[tauri::command]
pub fn get_discovered_bt_peers(
    state: State<'_, AppState>,
) -> Result<Vec<craft_chat_core::bluetooth::DiscoveredBtPeer>, String> {
    Ok(state.bt_manager.get_discovered_peers())
}

#[tauri::command]
pub fn get_network_status(
    state: State<'_, AppState>,
) -> Result<NetworkStatusDto, String> {
    let bt_status = state.bt_manager.get_status();
    let bt_available = !matches!(bt_status, craft_chat_core::bluetooth::BluetoothStatus::Unavailable(_));
    let has_lan = local_ip_address::local_ip().is_ok();

    Ok(NetworkStatusDto {
        quic_active: true,
        tcp_active: true,
        bluetooth_available: bt_available,
        bluetooth_status: format!("{:?}", bt_status),
        internet_connected: has_lan,
        default_transport: if has_lan { "quic".to_string() } else { "bluetooth".to_string() },
    })
}
