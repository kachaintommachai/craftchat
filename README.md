# CraftChat (LINE PC - LAN P2P Edition)

โปรแกรมแชทและรับส่งไฟล์แบบ **Peer-to-Peer (P2P)** ภายในวงแลน (Local Area Network) ทำงานแบบ **Air-Gapped / Local-only 100%** ไม่มีเซิร์ฟเวอร์ส่วนกลาง ไม่ส่งข้อมูลออกสู่อินเทอร์เน็ต ถอดแบบหน้าตาและประสบการณ์ใช้งาน (UI/UX) มาจาก **LINE PC**

---

## จุดเด่นและคุณสมบัติ (Key Features)

1. **LINE PC Style Interface**:
   - แถบเมนูด้านซ้าย (Sidebar) สไตล์ LINE PC (Chats, Friends, Settings, Profile Avatar, Dark Mode toggle)
   - หน้าต่างแชท Bubble เขียว-ขาวสไตล์ LINE รองรับ Dark Mode อัตโนมัติ
   - ระบบ **ตอบกลับข้อความ (Reply)** พร้อม Preview ข้อความต้นฉบับ
   - ระบบ **สติกเกอร์แสดงอารมณ์ (Sticker System)**: LINE Friends (บราวน์, โคนี่, แซลลี่), สัตว์เลี้ยงน่ารัก และ Reactions พร้อมตัวเลือกส่งแบบ 1-click
   - ระบบ **จับภาพหน้าจอและวาดเส้น (Screen Capture & Annotation)**: จับภาพจอหรือหน้าต่างโปรแกรม, วาดเส้นอิสระ, ตีกรอบสี่เหลี่ยมเน้นข้อความ, ชี้ลูกศร, ปรับสีและความหนาเส้น พร้อมปุ่มส่งเข้าห้องแชททันที
   - ระบบ **โทรด้วยเสียงและวิดีโอคอล (Voice & Video Call)**: ถอดแบบหน้าต่างคอล LINE PC พร้อมกล่องสายเรียกเข้า, ตัวจับเวลาสนทนา, กล้อง Picture-in-Picture, เปิด/ปิดไมค์, สลับกล้อง และแชร์หน้าจอ (Screen Sharing) โดยใช้ WebRTC สตรีมข้อมูลตรงผ่านวง LAN โดยไม่ต้องต่อเน็ตและไม่ต้องมีเซิร์ฟเวอร์ STUN/TURN
   - ระบบ **โปรไฟล์และรายละเอียดเครื่อง (Device Profile Card)**: กดที่ไอคอนคนเพื่อดูชื่อเครื่องคอมพิวเตอร์ (Hostname), IP Address, Port, และกุญแจเข้ารหัส
   - ระบบ **ส่งไฟล์และรูปภาพ** แบบ Drag & Drop พร้อมระบุขนาดและปุ่มเปิดโฟลเดอร์ไฟล์ปลายทาง
2. **Auto-Discovery ในวง LAN (mDNS)**:
   - ค้นหาเครื่องเพื่อนหรืออุปกรณ์อื่นๆ ใน Subnet วงแลนเดียวกันโดยอัตโนมัติ (Zero-configuration ผ่าน `mdns-sd`)
3. **P2P Direct Connection & Chunked Streaming**:
   - สื่อสารระหว่างเครื่องผ่าน **TCP Socket โดยตรง** ไม่ต้องผ่านตัวกลาง
   - รับส่งไฟล์ขนาดใหญ่แบบแบ่ง Chunk (64 KB/chunk) พร้อมคำนวณ Progress
4. **Local End-to-End Encryption (E2EE)**:
   - กุญแจแลกเปลี่ยน **X25519**
   - เข้ารหัสข้อความและไฟล์มีเดียด้วย **XChaCha20-Poly1305** พร้อม Nonce 24-byte ป้องกันการถูกดักฟังในวงแลน (Packet Sniffing / ARP Spoofing)
5. **Local Storage (SQLite)**:
   - เก็บประวัติการแชทและข้อมูลเพื่อนในเครื่องผู้ใช้ด้วย SQLite (`rusqlite`) เปิดโหมด **WAL (Write-Ahead Logging)**

---

## โครงสร้างโปรเจกต์ (Project Structure)

```text
craft-chat/
├── Cargo.toml                       # Root Cargo Workspace
├── package.json                     # Frontend React & Tauri Scripts
├── tailwind.config.js               # LINE PC Theme Palette & Dark Mode
├── vite.config.ts                   # Vite Bundler Configuration
│
├── crates/                          # Rust Backend Core Engine
│   └── craft-chat-core/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs
│           ├── crypto.rs            # X25519 + XChaCha20-Poly1305 E2EE
│           ├── storage.rs           # SQLite Database & Migrations
│           ├── protocol.rs          # Framed Binary TCP Protocol
│           ├── discovery.rs         # mDNS Auto-Discovery
│           ├── server.rs            # TCP P2P Inbound Listener
│           ├── client.rs            # TCP Outbound Streamer
│           └── bin/
│               └── daemon.rs        # CLI Terminal P2P Runner สำหรับทดสอบ
│
├── src-tauri/                       # Tauri v2 Desktop Shell Wrapper
│   ├── Cargo.toml
│   ├── tauri.conf.json              # Window settings, permissions & bundles
│   └── src/
│       ├── lib.rs                   # Tauri Core Lifecycle & State
│       ├── main.rs                  # Native Entry point
│       └── commands.rs              # Tauri IPC Handlers
│
└── src/                             # Frontend (React 19 + TypeScript + Tailwind)
    ├── App.tsx                      # State Coordinator & Event Listener
    ├── main.tsx
    ├── index.css
    ├── types.ts                     # TypeScript Types (Messages, Peers, Profile)
    └── components/
        ├── Sidebar.tsx              # เมนูซ้ายสุดสไตล์ LINE PC
        ├── PeerList.tsx             # รายชื่ออุปกรณ์ในวง LAN
        ├── ChatWindow.tsx           # หน้าต่างแชท, Bubble, Reply & Attachments
        └── SettingsModal.tsx        # หน้าต่างตั้งค่า Display Name & Network Port
```

---

## ขั้นตอนการติดตั้งและทดสอบ (Getting Started)

### 1. ทดสอบ Core Engine และรัน Unit Test
Core Engine ของ Rust ได้รับการออกแบบแยกส่วนเพื่อความเร็วในการทดสอบและไม่ขึ้นกับ GUI:

```bash
cd crates/craft-chat-core
cargo test
```
*(ทดสอบระบบแลกเปลี่ยนกุญแจ E2EE และระบบ SQLite In-Memory สำเร็จ 100%)*

### 2. ทดลองรัน P2P Terminal Daemon สำหรับทดสอบ 2 เครื่องใน LAN
คุณสามารถเปิด Terminal และรันโหนดแชทเพื่อคุยข้ามเครื่องได้ทันที:

```bash
cargo run --bin daemon
```
- พิมพ์ `/peers` เพื่อดูรายชื่อเครื่องที่ mDNS ค้นพบใน LAN
- พิมพ์ `/send <peer_id> <ข้อความ>` เพื่อส่งข้อความเข้ารหัส E2EE ไปยังเครื่องเป้าหมาย

### 3. รันหน้าต่าง UI Preview (Web Development)
```bash
npm install
npm run dev
```
เปิดบราวเซอร์ที่ `http://localhost:1420` เพื่อดู UI ถอดแบบ LINE PC (พร้อมระบบจำลอง Mock Peers, Dark Mode, Bubble Chat และ Reply)

---

## การคอมไพล์เป็นไฟล์ติดตั้ง Desktop (Windows, macOS, Linux)

ก่อนคอมไพล์บน Linux จำเป็นต้องมี WebKitGTK library สำหรับ GUI Webview:
```bash
sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```
*(บน Windows และ macOS ไม่ต้องลง library เพิ่มเติม เพราะใช้ WebView2 และ WebKit ประจำระบบปฏิบัติการโดยตรง)*

### รันแบบ Desktop App (Hot-reload)
```bash
npm run tauri dev
```

### คอมไพล์เป็น Production Installers
```bash
npm run tauri build
```

ไฟล์ติดตั้งที่ได้รับจะอยู่ที่โฟลเดอร์ `src-tauri/target/release/bundle/`:
- **Windows**: `.msi` (Windows Installer) และ `.exe` (Setup Wizard)
- **macOS**: `.dmg` (Drag-to-Applications) และ `.app` (Universal Apple Silicon & Intel)
- **Linux**: `.AppImage` (พกพา ดับเบิลคลิกเปิดได้ทันที) และ `.deb` (สำหรับ Debian/Ubuntu)
