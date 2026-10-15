# CraftChat (LAN P2P Edition)

โปรแกรมแชทและรับส่งไฟล์แบบ **Peer-to-Peer (P2P)** ภายในวงแลน (Local Area Network) ทำงานแบบ **Air-Gapped / Local-only 100%** ไม่มีเซิร์ฟเวอร์ส่วนกลาง ไม่ส่งข้อมูลออกสู่อินเทอร์เน็ต พร้อมหน้าตาและประสบการณ์ใช้งาน (UI/UX) ที่ทันสมัย สวยงาม คุ้นเคย ใช้งานง่าย

---

## 📥 ดาวน์โหลดโปรแกรมพร้อมใช้งาน (Direct Downloads)

ดาวน์โหลดไฟล์สำเร็จรูปพร้อมเปิดใช้งานหน้าต่างโปรแกรม (GUI) ได้ทันที โดยไม่ต้องติดตั้ง ไม่ต้องต่อเน็ต และไม่ต้องคอมไพล์โค้ด:

| ระบบปฏิบัติการ | แพ็กเกจ / ชนิดไฟล์ | ขนาด | ลิงก์ดาวน์โหลด | วิธีใช้งาน |
| :--- | :--- | :---: | :--- | :--- |
| 🪟 **Windows** | **Standalone GUI (.zip)** *(แนะนำ)* | 14 MB | [⬇️ ดาวน์โหลด CraftChat-Windows.zip](https://github.com/kachaintommachai/craftchat/raw/main/releases/windows/CraftChat-Windows.zip) | แตกไฟล์ ดับเบิลคลิก `CraftChat.exe` เปิดหน้าต่างโปรแกรมทันที |
| 🪟 **Windows** | Portable Single Binary (`.exe`) | 3.2 MB | [⬇️ ดาวน์โหลด CraftChat.exe](https://github.com/kachaintommachai/craftchat/raw/main/releases/windows/CraftChat.exe) | ไบนารีเดียวจบ ฝัง UI ในตัว เปิดได้ทันที |
| 🐧 **Linux** | **Standalone AppImage** *(แนะนำ)* | 7.4 MB | [⬇️ ดาวน์โหลด CraftChat-x86_64.AppImage](https://github.com/kachaintommachai/craftchat/raw/main/releases/linux/CraftChat-x86_64.AppImage) | ให้สิทธิ์ `chmod +x` แล้วดับเบิลคลิกเปิดใช้งานได้ทันที (ฝัง UI ในตัว) |
| 🐧 **Linux** | Portable Archive (`.tar.gz`) | 8.1 MB | [⬇️ ดาวน์โหลด CraftChat-Linux-Portable.tar.gz](https://github.com/kachaintommachai/craftchat/raw/main/releases/linux/CraftChat-Linux-Portable.tar.gz) | แตกไฟล์ ดับเบิลคลิก `craftchat.sh` (สำหรับเครื่องที่ไม่มี FUSE) |
| 🍏 **macOS** | **Application Bundle (.zip)** | 5.1 MB | [⬇️ ดาวน์โหลด CraftChat-macOS.zip](https://github.com/kachaintommachai/craftchat/raw/main/releases/macos/CraftChat-macOS.zip) | แตกไฟล์ ลาก `CraftChat.app` เข้า Applications เปิดได้ทันที |

> 📁 **คลังไฟล์ติดตั้งและแพ็กเกจทั้งหมดบน GitHub:** [https://github.com/kachaintommachai/craftchat/tree/main/releases](https://github.com/kachaintommachai/craftchat/tree/main/releases)  
> 📖 **คู่มือเจาะลึกแต่ละ OS:** ดูรายละเอียดได้ที่ [releases/README.md](releases/README.md) และ [OS_BUILD_GUIDE.md](OS_BUILD_GUIDE.md)

---

## จุดเด่นและคุณสมบัติ (Key Features)

1. **Standalone GUI Launcher ทุก OS (Zero-Configuration)**:
   - เปิดใช้งานได้ทันทีในหน้าต่าง Desktop App เสมือนแอพพลิเคชัน Native
   - มีระบบ Keep-Alive Embedded Server ป้องกันปัญหาเชื่อมต่อไม่ได้ (*This site can't be reached*)
   - ใช้งานแบบ **Air-Gapped 100%** ไม่ต้องเชื่อมต่ออินเทอร์เน็ต และไม่มีเซิร์ฟเวอร์ส่วนกลาง
2. **ระบบธีมสีพรีเมียม (Royal Red & Gold) พร้อม Theme Customizer**:
   - ธีมเริ่มต้นเน้น **สีขาว แดง ทอง และดำ** สวยงาม หรูหรา สบายตา และมีเอกลักษณ์
   - ผู้ใช้งานสามารถเลือกเปลี่ยนธีมเองได้ตามใจชอบ เช่น *LINE Classic Green*, *Sapphire Ocean*, *Cyberpunk Dark* พร้อมสลับโหมดมืด (Dark Mode) และโหมดสว่าง (Light Mode) ทันที
3. **Modern Desktop Chat Interface & Full Communication**:
   - หน้าต่างแชท Bubble เขียว/แดง/ขาว ตามธีมที่เลือก พร้อมระบบตอบกลับข้อความ (Reply)
   - **ระบบเดาสติกเกอร์อัตโนมัติ (Predictive Stickers)**: พิมพ์คำว่า "ขอบคุณ", "555", "รัก", "โกรธ", "ดีใจ" ระบบจะแนะนำสติกเกอร์ขึ้นมาให้กดส่งได้ทันที 1-Click
   - **คลังสติกเกอร์ LINE Official & Flaticon Message**: หมี Brown, โคนี่ Cony, แซลลี่ Sally, และไอคอนอารมณ์กว่า 100 แบบ
   - **โทรด้วยเสียงและวิดีโอคอล (Voice & Video Call)**: เชื่อมต่อคุยเสียงและวิดีโอแบบ P2P ผ่านวง LAN ชัดเจน ไร้ดีเลย์ และไม่ต้องมีเซิร์ฟเวอร์ STUN/TURN
   - **เครื่องมือจับภาพหน้าจอและวาดเขียน (Screen Capture & Annotation)**: แคปหน้าจอคอม วาดเส้น ปากกา ตีกรอบสี่เหลี่ยม ชี้ลูกศร และส่งเข้าห้องแชททันที
   - **ส่งไฟล์และรูปภาพไม่จำกัดขนาด**: สตรีมมิ่งไฟล์แบบแบ่ง Chunk ด้วยความเร็วเต็มสปีดของสายแลนและ Wi-Fi
4. **Auto-Discovery ในวง LAN (mDNS) & Bluetooth ไร้เน็ต**:
   - ค้นหาเครื่องเพื่อนร่วมงานในเครือข่ายอัตโนมัติ ไม่ต้องกรอก IP หรือพอร์ต
   - รองรับโหมด Bluetooth Low Energy (BLE P2P) เมื่ออยู่ในพื้นที่ไม่มีสัญญาณ Wi-Fi และไม่มีเราเตอร์
5. **Local End-to-End Encryption (E2EE)**:
   - แลกเปลี่ยนกุญแจด้วย **X25519**
   - เข้ารหัสข้อความและไฟล์ด้วย **XChaCha20-Poly1305** มาตรฐานความปลอดภัยระดับสากล ปลอดภัยจากการดักฟัง 100%
6. **Local Storage (SQLite WAL)**:
   - บันทึกประวัติการแชทและรายชื่อเพื่อนไว้ในเครื่องผู้ใช้ด้วย SQLite พร้อมโหมด WAL รวดเร็วและปลอดภัย

---

## โครงสร้างโปรเจกต์ (Project Structure)

```text
craft-chat/
├── Cargo.toml                       # Root Cargo Workspace
├── package.json                     # Frontend React & Tauri Scripts
├── tailwind.config.js               # Theme Palette & Dark Mode
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
        ├── Sidebar.tsx              # เมนูซ้ายสุด (Desktop Sidebar)
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
เปิดบราวเซอร์ที่ `http://localhost:1420` เพื่อดู UI ของ CraftChat (พร้อมระบบจำลอง Mock Peers, Dark Mode, Bubble Chat และ Reply)

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
