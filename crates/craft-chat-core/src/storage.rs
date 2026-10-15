use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::sync::{Arc, Mutex};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PeerRecord {
    pub peer_id: String,
    pub name: String,
    pub ip: String,
    pub port: u16,
    pub pubkey: String,
    pub online: bool,
    pub unread_count: u32,
    pub last_message: Option<String>,
    pub last_message_time: Option<String>,
    #[serde(default)]
    pub status_text: Option<String>,
    #[serde(default)]
    pub status_sticker: Option<String>,
    #[serde(default)]
    pub avatar_url: Option<String>,
    #[serde(default = "default_transport")]
    pub transport: Option<String>,
    #[serde(default)]
    pub bluetooth_address: Option<String>,
    #[serde(default)]
    pub rssi: Option<i16>,
}

fn default_transport() -> Option<String> {
    Some("quic".to_string())
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GroupRecord {
    pub group_id: String,
    pub name: String,
    pub members: Vec<String>,
    pub created_at: String,
    pub last_message: Option<String>,
    pub last_message_time: Option<String>,
    pub unread_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageRecord {
    pub id: String,
    pub sender_id: String,
    pub sender_name: Option<String>,
    pub recipient_id: String,
    pub group_id: Option<String>,
    pub content: String,
    pub message_type: String,
    pub file_name: Option<String>,
    pub file_path: Option<String>,
    pub file_size: Option<u64>,
    pub reply_to_id: Option<String>,
    pub is_mine: bool,
    pub created_at: String,
}

#[derive(Clone)]
pub struct Database {
    conn: Arc<Mutex<Connection>>,
}

impl Database {
    pub fn init<P: AsRef<Path>>(path: P) -> Result<Self> {
        let conn = Connection::open(path)?;

        conn.pragma_update(None, "journal_mode", "WAL")?;
        conn.pragma_update(None, "synchronous", "NORMAL")?;
        conn.pragma_update(None, "foreign_keys", "ON")?;

        let db = Self {
            conn: Arc::new(Mutex::new(conn)),
        };
        db.create_tables()?;
        Ok(db)
    }

    pub fn init_in_memory() -> Result<Self> {
        let conn = Connection::open_in_memory()?;
        let db = Self {
            conn: Arc::new(Mutex::new(conn)),
        };
        db.create_tables()?;
        Ok(db)
    }

    fn create_tables(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch(
            r#"
            CREATE TABLE IF NOT EXISTS peers (
                peer_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                ip TEXT NOT NULL,
                port INTEGER NOT NULL,
                pubkey TEXT NOT NULL,
                last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS groups (
                group_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                members TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                sender_id TEXT NOT NULL,
                sender_name TEXT,
                recipient_id TEXT NOT NULL,
                group_id TEXT,
                content TEXT NOT NULL,
                message_type TEXT NOT NULL DEFAULT 'text',
                file_name TEXT,
                file_path TEXT,
                file_size INTEGER,
                reply_to_id TEXT,
                is_mine INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                is_read INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_messages_pair 
            ON messages(sender_id, recipient_id, created_at);

            CREATE INDEX IF NOT EXISTS idx_messages_group
            ON messages(group_id, created_at);
            "#,
        )?;

        // Auto-migrations for modern transport & profile columns
        let _ = conn.execute("ALTER TABLE peers ADD COLUMN status_text TEXT;", []);
        let _ = conn.execute("ALTER TABLE peers ADD COLUMN status_sticker TEXT;", []);
        let _ = conn.execute("ALTER TABLE peers ADD COLUMN avatar_url TEXT;", []);
        let _ = conn.execute("ALTER TABLE peers ADD COLUMN transport TEXT DEFAULT 'quic';", []);
        let _ = conn.execute("ALTER TABLE peers ADD COLUMN bluetooth_address TEXT;", []);
        let _ = conn.execute("ALTER TABLE peers ADD COLUMN rssi INTEGER;", []);

        Ok(())
    }

    pub fn upsert_peer(
        &self,
        peer_id: &str,
        name: &str,
        ip: &str,
        port: u16,
        pubkey: &str,
    ) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            r#"
            INSERT INTO peers (peer_id, name, ip, port, pubkey, last_seen)
            VALUES (?1, ?2, ?3, ?4, ?5, CURRENT_TIMESTAMP)
            ON CONFLICT(peer_id) DO UPDATE SET
                name = excluded.name,
                ip = excluded.ip,
                port = excluded.port,
                pubkey = excluded.pubkey,
                last_seen = CURRENT_TIMESTAMP
            "#,
            params![peer_id, name, ip, port, pubkey],
        )?;
        Ok(())
    }

    pub fn get_peers(&self) -> Result<Vec<PeerRecord>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            r#"
            SELECT p.peer_id, p.name, p.ip, p.port, p.pubkey,
                   (SELECT content FROM messages 
                    WHERE (sender_id = p.peer_id OR recipient_id = p.peer_id) 
                    ORDER BY created_at DESC LIMIT 1) as last_msg,
                   (SELECT created_at FROM messages 
                    WHERE (sender_id = p.peer_id OR recipient_id = p.peer_id) 
                    ORDER BY created_at DESC LIMIT 1) as last_time,
                   (SELECT COUNT(*) FROM messages 
                    WHERE sender_id = p.peer_id AND is_read = 0) as unread,
                   p.status_text, p.status_sticker, p.avatar_url, p.transport, p.bluetooth_address, p.rssi
            FROM peers p
            ORDER BY p.last_seen DESC
            "#,
        )?;

        let peers = stmt
            .query_map([], |row| {
                Ok(PeerRecord {
                    peer_id: row.get(0)?,
                    name: row.get(1)?,
                    ip: row.get(2)?,
                    port: row.get(3)?,
                    pubkey: row.get(4)?,
                    online: true,
                    last_message: row.get(5)?,
                    last_message_time: row.get(6)?,
                    unread_count: row.get(7)?,
                    status_text: row.get(8)?,
                    status_sticker: row.get(9)?,
                    avatar_url: row.get(10)?,
                    transport: row.get(11)?,
                    bluetooth_address: row.get(12)?,
                    rssi: row.get(13)?,
                })
            })?
            .filter_map(|r| r.ok())
            .collect();

        Ok(peers)
    }

    pub fn get_peer(&self, peer_id: &str) -> Result<Option<PeerRecord>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT peer_id, name, ip, port, pubkey, status_text, status_sticker, avatar_url, transport, bluetooth_address, rssi FROM peers WHERE peer_id = ?1")?;
        let mut rows = stmt.query(params![peer_id])?;

        if let Some(row) = rows.next()? {
            Ok(Some(PeerRecord {
                peer_id: row.get(0)?,
                name: row.get(1)?,
                ip: row.get(2)?,
                port: row.get(3)?,
                pubkey: row.get(4)?,
                online: true,
                unread_count: 0,
                last_message: None,
                last_message_time: None,
                status_text: row.get(5)?,
                status_sticker: row.get(6)?,
                avatar_url: row.get(7)?,
                transport: row.get(8)?,
                bluetooth_address: row.get(9)?,
                rssi: row.get(10)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn update_peer_status(
        &self,
        peer_id: &str,
        status_text: Option<&str>,
        status_sticker: Option<&str>,
    ) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE peers SET status_text = ?1, status_sticker = ?2 WHERE peer_id = ?3",
            params![status_text, status_sticker, peer_id],
        )?;
        Ok(())
    }

    pub fn update_peer_transport(
        &self,
        peer_id: &str,
        transport: &str,
        bluetooth_address: Option<&str>,
        rssi: Option<i16>,
    ) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE peers SET transport = ?1, bluetooth_address = ?2, rssi = ?3 WHERE peer_id = ?4",
            params![transport, bluetooth_address, rssi, peer_id],
        )?;
        Ok(())
    }

    pub fn save_message(&self, msg: &MessageRecord) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            r#"
            INSERT INTO messages (
                id, sender_id, sender_name, recipient_id, group_id, content, message_type,
                file_name, file_path, file_size, reply_to_id, is_mine, created_at, is_read
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)
            "#,
            params![
                msg.id,
                msg.sender_id,
                msg.sender_name,
                msg.recipient_id,
                msg.group_id,
                msg.content,
                msg.message_type,
                msg.file_name,
                msg.file_path,
                msg.file_size,
                msg.reply_to_id,
                if msg.is_mine { 1 } else { 0 },
                msg.created_at,
                if msg.is_mine { 1 } else { 0 }
            ],
        )?;
        Ok(())
    }

    pub fn get_messages_for_peer(&self, my_id: &str, peer_id: &str) -> Result<Vec<MessageRecord>> {
        let conn = self.conn.lock().unwrap();

        let _ = conn.execute(
            "UPDATE messages SET is_read = 1 WHERE sender_id = ?1 AND group_id IS NULL",
            params![peer_id],
        );

        let mut stmt = conn.prepare(
            r#"
            SELECT id, sender_id, sender_name, recipient_id, group_id, content, message_type,
                   file_name, file_path, file_size, reply_to_id, is_mine, created_at
            FROM messages
            WHERE ((sender_id = ?1 AND recipient_id = ?2)
               OR (sender_id = ?2 AND recipient_id = ?1))
               AND group_id IS NULL
            ORDER BY created_at ASC
            "#,
        )?;

        let msgs = stmt
            .query_map(params![my_id, peer_id], |row| {
                let is_mine_val: i32 = row.get(11)?;
                Ok(MessageRecord {
                    id: row.get(0)?,
                    sender_id: row.get(1)?,
                    sender_name: row.get(2)?,
                    recipient_id: row.get(3)?,
                    group_id: row.get(4)?,
                    content: row.get(5)?,
                    message_type: row.get(6)?,
                    file_name: row.get(7)?,
                    file_path: row.get(8)?,
                    file_size: row.get(9)?,
                    reply_to_id: row.get(10)?,
                    is_mine: is_mine_val == 1,
                    created_at: row.get(12)?,
                })
            })?
            .filter_map(|r| r.ok())
            .collect();

        Ok(msgs)
    }

    pub fn create_group(&self, group: &GroupRecord) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let members_json = serde_json::to_string(&group.members).unwrap_or_else(|_| "[]".into());
        conn.execute(
            r#"
            INSERT INTO groups (group_id, name, members, created_at)
            VALUES (?1, ?2, ?3, ?4)
            ON CONFLICT(group_id) DO UPDATE SET
                name = excluded.name,
                members = excluded.members
            "#,
            params![group.group_id, group.name, members_json, group.created_at],
        )?;
        Ok(())
    }

    pub fn get_groups(&self) -> Result<Vec<GroupRecord>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            r#"
            SELECT g.group_id, g.name, g.members, g.created_at,
                   (SELECT content FROM messages WHERE group_id = g.group_id ORDER BY created_at DESC LIMIT 1) as last_msg,
                   (SELECT created_at FROM messages WHERE group_id = g.group_id ORDER BY created_at DESC LIMIT 1) as last_time,
                   (SELECT COUNT(*) FROM messages WHERE group_id = g.group_id AND is_read = 0 AND is_mine = 0) as unread
            FROM groups g
            ORDER BY g.created_at DESC
            "#,
        )?;

        let groups = stmt
            .query_map([], |row| {
                let members_str: String = row.get(2)?;
                let members: Vec<String> = serde_json::from_str(&members_str).unwrap_or_default();
                Ok(GroupRecord {
                    group_id: row.get(0)?,
                    name: row.get(1)?,
                    members,
                    created_at: row.get(3)?,
                    last_message: row.get(4)?,
                    last_message_time: row.get(5)?,
                    unread_count: row.get(6)?,
                })
            })?
            .filter_map(|r| r.ok())
            .collect();

        Ok(groups)
    }

    pub fn get_group(&self, group_id: &str) -> Result<Option<GroupRecord>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT group_id, name, members, created_at FROM groups WHERE group_id = ?1")?;
        let mut rows = stmt.query(params![group_id])?;

        if let Some(row) = rows.next()? {
            let members_str: String = row.get(2)?;
            let members: Vec<String> = serde_json::from_str(&members_str).unwrap_or_default();
            Ok(Some(GroupRecord {
                group_id: row.get(0)?,
                name: row.get(1)?,
                members,
                created_at: row.get(3)?,
                last_message: None,
                last_message_time: None,
                unread_count: 0,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_messages_for_group(&self, group_id: &str) -> Result<Vec<MessageRecord>> {
        let conn = self.conn.lock().unwrap();

        let _ = conn.execute(
            "UPDATE messages SET is_read = 1 WHERE group_id = ?1",
            params![group_id],
        );

        let mut stmt = conn.prepare(
            r#"
            SELECT id, sender_id, sender_name, recipient_id, group_id, content, message_type,
                   file_name, file_path, file_size, reply_to_id, is_mine, created_at
            FROM messages
            WHERE group_id = ?1
            ORDER BY created_at ASC
            "#,
        )?;

        let msgs = stmt
            .query_map(params![group_id], |row| {
                let is_mine_val: i32 = row.get(11)?;
                Ok(MessageRecord {
                    id: row.get(0)?,
                    sender_id: row.get(1)?,
                    sender_name: row.get(2)?,
                    recipient_id: row.get(3)?,
                    group_id: row.get(4)?,
                    content: row.get(5)?,
                    message_type: row.get(6)?,
                    file_name: row.get(7)?,
                    file_path: row.get(8)?,
                    file_size: row.get(9)?,
                    reply_to_id: row.get(10)?,
                    is_mine: is_mine_val == 1,
                    created_at: row.get(12)?,
                })
            })?
            .filter_map(|r| r.ok())
            .collect();

        Ok(msgs)
    }

    pub fn get_setting(&self, key: &str) -> Result<Option<String>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT value FROM settings WHERE key = ?1")?;
        let mut rows = stmt.query(params![key])?;
        if let Some(row) = rows.next()? {
            Ok(Some(row.get(0)?))
        } else {
            Ok(None)
        }
    }

    pub fn set_setting(&self, key: &str, value: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO settings (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            params![key, value],
        )?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sqlite_db_operations() {
        let db = Database::init_in_memory().unwrap();

        // 1. Peer upsert
        db.upsert_peer("node-alice", "Alice", "192.168.1.50", 4242, "pubkey123").unwrap();
        let peer = db.get_peer("node-alice").unwrap().unwrap();
        assert_eq!(peer.name, "Alice");

        // 2. Save Message
        let msg = MessageRecord {
            id: "msg-1".into(),
            sender_id: "node-alice".into(),
            sender_name: Some("Alice".into()),
            recipient_id: "node-me".into(),
            group_id: None,
            content: "Hello from LAN!".into(),
            message_type: "text".into(),
            file_name: None,
            file_path: None,
            file_size: None,
            reply_to_id: None,
            is_mine: false,
            created_at: "10:00".into(),
        };
        db.save_message(&msg).unwrap();

        let msgs = db.get_messages_for_peer("node-me", "node-alice").unwrap();
        assert_eq!(msgs.len(), 1);
        assert_eq!(msgs[0].content, "Hello from LAN!");

        // 3. Group operations
        let group = GroupRecord {
            group_id: "group-dev".into(),
            name: "Dev Team".into(),
            members: vec!["node-me".into(), "node-alice".into()],
            created_at: "10:05".into(),
            last_message: None,
            last_message_time: None,
            unread_count: 0,
        };
        db.create_group(&group).unwrap();

        let groups = db.get_groups().unwrap();
        assert_eq!(groups.len(), 1);
        assert_eq!(groups[0].name, "Dev Team");
        assert_eq!(groups[0].members.len(), 2);

        // 4. Save Group Message
        let group_msg = MessageRecord {
            id: "msg-grp-1".into(),
            sender_id: "node-alice".into(),
            sender_name: Some("Alice".into()),
            recipient_id: "".into(),
            group_id: Some("group-dev".into()),
            content: "Hello dev team!".into(),
            message_type: "text".into(),
            file_name: None,
            file_path: None,
            file_size: None,
            reply_to_id: None,
            is_mine: false,
            created_at: "10:06".into(),
        };
        db.save_message(&group_msg).unwrap();

        let grp_msgs = db.get_messages_for_group("group-dev").unwrap();
        assert_eq!(grp_msgs.len(), 1);
        assert_eq!(grp_msgs[0].content, "Hello dev team!");
    }
}
