# 🌐 คู่มือการติดตั้งและสร้างไฟล์สำหรับใช้งานในระบบปฏิบัติการต่าง ๆ (Cross-Platform Deployment Guide)

เอกสารนี้รวบรวมไฟล์สคริปต์, ระบบ CI/CD อัตโนมัติ และขั้นตอนการติดตั้ง/คอมไพล์ **CraftChat** สำหรับแต่ละระบบปฏิบัติการ (Windows, macOS, Linux, Android)

---

## 📦 0. ไฟล์โปรแกรมสำเร็จรูปพร้อมใช้งานทันที (Pre-built Binaries)

หากไม่ต้องการติดตั้ง Rust/Node.js บนเครื่องปลายทาง โปรเจกต์มีไฟล์ที่คอมไพล์พร้อมเปิด GUI ให้ทันทีในโฟลเดอร์ [`releases/`](releases/):
- **Windows:** [`releases/windows/CraftChat-Windows.zip`](releases/windows/CraftChat-Windows.zip) (แตกไฟล์ ดับเบิลคลิก `CraftChat.exe`)
- **Linux:** [`releases/linux/CraftChat-x86_64.AppImage`](releases/linux/CraftChat-x86_64.AppImage) และ [`releases/linux/CraftChat-Linux-Portable.tar.gz`](releases/linux/CraftChat-Linux-Portable.tar.gz)
- **macOS:** [`releases/macos/CraftChat-macOS.zip`](releases/macos/CraftChat-macOS.zip) (แตกไฟล์ ได้ `CraftChat.app`)

---

## 📁 โครงสร้างไฟล์สำหรับแต่ละ OS ที่เตรียมไว้ในโปรเจกต์

```text
craft-chat/
├── releases/                        # ไฟล์ไบนารีและแอพสำเร็จรูปสำหรับทุก OS
│   ├── README.md                    # คู่มือใช้งานสำหรับผู้ใช้ทั่วไป
│   ├── windows/CraftChat-Windows.zip
│   ├── linux/CraftChat-x86_64.AppImage & CraftChat-Linux-Portable.tar.gz
│   └── macos/CraftChat-macOS.zip
├── ci/
│   ├── README.md
│   └── workflows/
│       ├── release.yml      # CI/CD สร้างไฟล์ .exe, .msi, .dmg, .deb, .AppImage อัตโนมัติ
│       └── android.yml      # CI/CD สร้างไฟล์ Android .apk อัตโนมัติ
├── craftchat.desktop        # ไฟล์ทางลัด Launcher และไอคอนสำหรับระบบ Linux
├── dist-bin/
│   └── craft-chat-daemon    # ไบนารี Native สำหรับ Linux พร้อมรันได้ทันที
├── scripts/
│   ├── build-linux.sh       # สคริปต์คอมไพล์สำหรับ Linux
│   ├── build-windows.ps1    # สคริปต์ PowerShell คอมไพล์สำหรับ Windows
│   ├── build-macos.sh       # สคริปต์คอมไพล์ Universal .dmg สำหรับ macOS
│   ├── build-android.sh     # สคริปต์คอมไพล์ Android APK
│   └── install-linux.sh     # สคริปต์ติดตั้งแอปลงระบบ Linux (Shortcut & Menu)
└── src-tauri/
    └── tauri.conf.json      # การตั้งค่า Bundle Packages ทุกแพลตฟอร์ม
```

---

## ⚡ 1. ระบบสร้างไฟล์อัตโนมัติผ่าน GitHub Actions (แนะนำที่สุด)

ไม่ต้องลงเครื่องมือของทุก OS ในคอมพิวเตอร์ของคุณ โปรเจกต์ได้เตรียมแม่แบบ **GitHub Actions** ไว้ในโฟลเดอร์ [`ci/workflows/`](file:///home/itcm/Downloads/Project1/craft-chat/ci/workflows/) ซึ่งสามารถนำไปเปิดใช้งานบน GitHub เพื่อสั่งคอมไพล์ไฟล์ติดตั้งบน Cloud Runners (Windows, macOS, Ubuntu) ได้โดยอัตโนมัติ:

### ผลลัพธ์ไฟล์ติดตั้งที่ระบบจะสร้างให้:
- 🪟 **Windows:** `CraftChat_0.1.0_x64_en-US.msi` และ `CraftChat_0.1.0_x64-setup.exe`
- 🍏 **macOS:** `CraftChat_0.1.0_universal.dmg` (รองรับทั้ง Apple Silicon M1-M4 และ Intel Core)
- 🐧 **Linux:** `craft-chat_0.1.0_amd64.deb` และ `CraftChat_0.1.0_amd64.AppImage`
- 📱 **Android:** `craftchat-android-apk` (จาก [`ci/workflows/android.yml`](file:///home/itcm/Downloads/Project1/craft-chat/ci/workflows/android.yml))

### วิธีเปิดใช้งานและสั่งสร้างไฟล์ผ่าน GitHub:
1. คัดลอกโฟลเดอร์ `ci/workflows/*` ไปไว้ที่ `.github/workflows/` ใน GitHub Repository
2. ไปที่แท็บ **Actions** บน GitHub -> เลือก **Build and Release CraftChat (Multi-OS)**
3. กดปุ่ม **Run workflow** -> ใส่ Tag เช่น `v0.1.0` แล้วกดสั่งรัน
4. เมื่อสร้างเสร็จ ไฟล์ตัวติดตั้งของทุก OS จะไปปรากฏที่แท็บ **Releases** ให้ดาวน์โหลดทันที

---

## 🐧 2. การใช้งานบน Linux (Ubuntu, Debian, Fedora, Arch)

### วิธีที่ 1: ใช้งานไฟล์ Daemon ที่คอมไพล์พร้อมแล้ว
ในโฟลเดอร์ [`dist-bin/`](file:///home/itcm/Downloads/Project1/craft-chat/dist-bin/) มีไฟล์ไบนารี `craft-chat-daemon` ที่คอมไพล์เรียบร้อย สามารถรันได้ทันที:
```bash
./dist-bin/craft-chat-daemon
```

### วิธีที่ 2: ติดตั้งไอคอนและ Launcher ลงในเมนูเครื่อง (Application Menu)
```bash
./scripts/install-linux.sh
```

### วิธีที่ 3: คอมไพล์ GUI Desktop (.deb / .AppImage) บนเครื่องตัวเอง
```bash
# ติดตั้ง Library ที่จำเป็น (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf libssl-dev libdbus-1-dev

# รันสคริปต์คอมไพล์
./scripts/build-linux.sh
```

---

## 🪟 3. การใช้งานบน Windows (Windows 10 / 11 64-bit)

### ความต้องการก่อนคอมไพล์บนเครื่องตัวเอง:
1. **Node.js:** v18 ขึ้นไป
2. **Rust & Cargo:** [https://rustup.rs](https://rustup.rs) (MSVC Toolchain)
3. **Visual Studio C++ Build Tools:** พร้อม Windows SDK

### วิธีคอมไพล์:
เปิด **PowerShell** ในโฟลเดอร์โปรเจกต์ แล้วรัน:
```powershell
.\scripts\build-windows.ps1
```
ไฟล์ติดตั้ง `.msi` และ `.exe` จะถูกบันทึกอยู่ที่:
- `src-tauri\target\release\bundle\msi\`
- `src-tauri\target\release\bundle\nsis\`

---

## 🍏 4. การใช้งานบน macOS (Apple Silicon & Intel)

### ความต้องการก่อนคอมไพล์บนเครื่องตัวเอง:
1. **Xcode Command Line Tools:** `xcode-select --install`
2. **Rust & Cargo:** `rustup target add aarch64-apple-darwin x86_64-apple-darwin`
3. **Node.js:** v18 ขึ้นไป

### วิธีคอมไพล์:
เปิด **Terminal** ในโฟลเดอร์โปรเจกต์ แล้วรัน:
```bash
chmod +x scripts/build-macos.sh
./scripts/build-macos.sh
```
ไฟล์ Universal `.dmg` (ลากลงโฟลเดอร์ Applications ใช้งานได้ทันที) จะอยู่ที่:
- `src-tauri/target/universal-apple-darwin/release/bundle/dmg/`

---

## 📱 5. การใช้งานบน Android (Mobile APK)

CraftChat รองรับการรันบน Android ผ่านระบบ Tauri v2 Mobile:

### วิธีคอมไพล์ผ่านสคริปต์:
```bash
chmod +x scripts/build-android.sh
./scripts/build-android.sh
```
หรือให้ **GitHub Actions** สร้าง APK ให้อัตโนมัติจากไฟล์ `.github/workflows/android.yml` โดยไม่ต้องติดตั้ง Android SDK/NDK ในเครื่อง
