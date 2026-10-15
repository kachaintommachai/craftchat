use std::path::PathBuf;
use std::sync::Arc;
use tokio::io::{self, AsyncBufReadExt, BufReader};
use tokio::sync::mpsc;

use craft_chat_core::{
    KeyPair, Database, DiscoveryEvent, DiscoveryManager,
    TcpP2pClient, TcpP2pServer,
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    println!("=====================================================");
    println!("  CraftChat LAN P2P Core Daemon (Serverless P2P)");
    println!("=====================================================");

    // 1. Storage & Identity
    let db = Database::init_in_memory()?;
    let keypair = KeyPair::generate();
    let peer_id = format!("node-{}", &keypair.public_hex()[..8]);
    let display_name = format!("Host-{}", &peer_id[peer_id.len().saturating_sub(4)..]);
    let port = 4242;
    let pubkey_hex = keypair.public_hex();
    let my_secret = Arc::new(keypair.secret);

    println!("🆔 My Peer ID: {}", peer_id);
    println!("🏷️ Display Name: {}", display_name);
    println!("🔑 X25519 PubKey: {}", pubkey_hex);
    println!("🔌 Listening Port: {}", port);

    // 2. Start TCP P2P Inbound Server
    let (msg_tx, mut msg_rx) = mpsc::unbounded_channel();
    let download_dir = PathBuf::from("./downloads");
    let server = TcpP2pServer::new(
        port,
        (*my_secret).clone(),
        db.clone(),
        download_dir,
        msg_tx,
    );
    tokio::spawn(async move {
        let _ = server.start().await;
    });

    // 3. Start mDNS Auto-Discovery
    let (disc_tx, mut disc_rx) = mpsc::unbounded_channel();
    let mut discovery = DiscoveryManager::new()?;
    discovery.register(&peer_id, &display_name, port, &pubkey_hex)?;
    discovery.start_browsing(disc_tx, db.clone(), peer_id.clone())?;

    println!("📡 mDNS Discovery & TCP Server Active!");
    println!("💡 Type text into this console or wait for LAN messages...\n");

    // Print incoming events in background
    let db_clone = db.clone();
    tokio::spawn(async move {
        while let Some(msg) = msg_rx.recv().await {
            println!("\n📩 [NEW MESSAGE from {}]: {}", msg.sender_id, msg.content);
        }
    });

    tokio::spawn(async move {
        while let Some(event) = disc_rx.recv().await {
            match event {
                DiscoveryEvent::Discovered { peer_id, name, ip, port, pubkey } => {
                    println!("\n🔍 [PEER FOUND]: {} ({}) at {}:{} [Pubkey: {}...]", name, peer_id, ip, port, &pubkey[..12]);
                }
                DiscoveryEvent::Offline { peer_id } => {
                    println!("\n👋 [PEER OFFLINE]: {}", peer_id);
                }
            }
        }
    });

    // Simple REPL console for sending messages
    let mut stdin = BufReader::new(io::stdin()).lines();
    while let Ok(Some(line)) = stdin.next_line().await {
        let line = line.trim();
        if line == "/peers" {
            let peers = db_clone.get_peers()?;
            println!("👥 Peers online in LAN: {}", peers.len());
            for p in peers {
                println!("   - {} ({}) {}:{}", p.name, p.peer_id, p.ip, p.port);
            }
        } else if line.starts_with("/send ") {
            let parts: Vec<&str> = line.splitn(3, ' ').collect();
            if parts.len() == 3 {
                let target_peer_id = parts[1];
                let text = parts[2];
                if let Ok(Some(peer)) = db_clone.get_peer(target_peer_id) {
                    let msg_id = format!("msg-{}", uuid::Uuid::new_v4());
                    let now = chrono::Local::now().format("%H:%M").to_string();
                    let _ = TcpP2pClient::send_text_message(
                        &peer.ip,
                        peer.port,
                        &peer.pubkey,
                        &my_secret,
                        &peer_id,
                        None,
                        None,
                        &msg_id,
                        None,
                        text,
                        &now,
                    )
                    .await;
                    println!("📤 Sent to {}: {}", peer.name, text);
                } else {
                    println!("❌ Peer ID not found in cache. Type /peers to list.");
                }
            }
        } else {
            println!("Commands:");
            println!("  /peers                       - แสดงรายชื่อเครื่องที่ค้นพบใน LAN");
            println!("  /send <peer_id> <message>    - ส่งข้อความเข้ารหัส E2EE ไปยังเครื่องเป้าหมาย");
        }
    }

    Ok(())
}
