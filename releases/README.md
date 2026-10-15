# 🚀 CraftChat Binary Releases (Windows, Linux, macOS)

ไฟล์โปรแกรมสำเร็จรูปสำหรับรันใช้งานได้ทันทีบนแต่ละระบบปฏิบัติการ โดยไม่ต้องติดตั้งและไม่ต้องเชื่อมต่ออินเทอร์เน็ต (100% Serverless P2P / Air-Gapped):

---

## 🪟 1. Windows (`.zip` / `.exe`)

### 📦 ไฟล์ติดตั้ง:
- **แพ็กเกจสมบูรณ์ (แนะนำ):** [`releases/windows/CraftChat-Windows.zip`](windows/CraftChat-Windows.zip) (ขนาด ~11 MB)
- **ตัว Launcher เดี่ยว:** [`releases/windows/CraftChat.exe`](windows/CraftChat.exe) (ขนาด ~280 KB)

### 💻 วิธีใช้งาน:
1. แตกไฟล์ `CraftChat-Windows.zip` (คลิกขวา -> Extract All...) จะได้โฟลเดอร์ `CraftChat-Windows`
2. ดับเบิลคลิกที่ไฟล์ **`CraftChat.exe`**
3. โปรแกรมจะเริ่มต้นระบบ P2P Engine ภายใน และเปิดหน้าต่างโปรแกรม GUI (ผ่าน Microsoft Edge / Chrome Window Mode) ทันที
4. พร้อมแชท ส่งไฟล์ โทรเสียง และส่งสติกเกอร์กับเครื่องอื่นในวง LAN ได้ทันที

---

## 🐧 2. Linux (`.AppImage` / `.tar.gz`)

### 📦 ไฟล์ติดตั้ง:
- **Standalone AppImage (แนะนำ):** [`releases/linux/CraftChat-x86_64.AppImage`](linux/CraftChat-x86_64.AppImage) (ขนาด ~4.9 MB)
- **Portable Tarball:** [`releases/linux/CraftChat-Linux-Portable.tar.gz`](linux/CraftChat-Linux-Portable.tar.gz) (ขนาด ~5.6 MB)

### 💻 วิธีใช้งาน:

#### ตัวเลือก ก: ใช้งานผ่าน AppImage
1. กำหนดสิทธิ์ Execute ให้ไฟล์ AppImage:
   ```bash
   chmod +x releases/linux/CraftChat-x86_64.AppImage
   ```
2. ดับเบิลคลิกที่ไฟล์ หรือสั่งรันผ่าน Terminal:
   ```bash
   ./releases/linux/CraftChat-x86_64.AppImage
   ```
3. *(กรณีเครื่องไม่มี FUSE หรือบน Ubuntu 24.04 ที่ปิดสิทธิ์ AppImage):*
   ```bash
   ./releases/linux/CraftChat-x86_64.AppImage --appimage-extract-and-run
   ```

#### ตัวเลือก ข: ใช้งานผ่าน Portable Tarball (สำหรับเครื่องที่ไม่มี FUSE)
1. แตกไฟล์:
   ```bash
   tar -xzf releases/linux/CraftChat-Linux-Portable.tar.gz
   cd CraftChat-Linux
   ```
2. ดับเบิลคลิกไฟล์ `craftchat.sh` หรือพิมพ์:
   ```bash
   ./craftchat.sh
   ```

---

## 🍏 3. macOS (`.app` / `.zip`)

### 📦 ไฟล์ติดตั้ง:
- **แอปพลิเคชันสำหรับ macOS (Universal):** [`releases/macos/CraftChat-macOS.zip`](macos/CraftChat-macOS.zip) (ขนาด ~5.1 MB)
- **โฟลเดอร์ App Bundle:** [`releases/macos/CraftChat.app`](macos/CraftChat.app)

### 💻 วิธีใช้งาน:
1. ดับเบิลคลิกแตกไฟล์ `CraftChat-macOS.zip` จะได้ `CraftChat.app`
2. ลาก `CraftChat.app` ไปไว้ในโฟลเดอร์ `/Applications` (หรือเปิดจากโฟลเดอร์ Downloads โดยตรงได้)
3. ดับเบิลคลิกเปิด `CraftChat.app` เพื่อเริ่มใช้งาน
4. *(กรณี macOS แจ้งเตือนความปลอดภัยเนื่องจากไม่ได้ผ่าน Notarization ของ Apple):*
   - คลิกขวาที่ `CraftChat.app` -> เลือก **Open** -> กดยืนยัน **Open**
   - หรือเปิด Terminal แล้วรันคำสั่งปลดล็อก:
     ```bash
     xattr -cr /Applications/CraftChat.app
     ```

---

## ⚙️ ข้อมูลทางเทคนิค (Technical Details)
- **สถาปัตยกรรม:** 64-bit Native Binary (Rust Core) + React 19 Frontend
- **พอร์ตการสื่อสาร P2P:** `TCP/UDP 4242` (mDNS Auto-Discovery & QUIC Stream)
- **พอร์ต GUI ภายในเครื่อง:** `HTTP 127.0.0.1:4243` (Local-only Keep-Alive Server ป้องกัน Connection Refused)
- **การเข้ารหัส:** X25519 Key Exchange + XChaCha20-Poly1305 End-to-End Encryption
- **เครือข่ายสำรอง:** Bluetooth Low Energy (BLE) P2P เมื่อไม่มีสัญญาณ Wi-Fi/เราเตอร์
