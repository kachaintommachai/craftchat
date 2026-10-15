# 🚀 CraftChat Binary Releases (Windows, Linux, macOS)

ไฟล์โปรแกรมสำเร็จรูปสำหรับรันใช้งานได้ทันทีบนแต่ละระบบปฏิบัติการ:

---

## 🪟 1. Windows (`.exe`)
- **ไฟล์:** [`releases/windows/CraftChat.exe`](windows/CraftChat.exe)
- **ประเภท:** Windows PE32+ 64-bit Executable
- **วิธีใช้งาน:**
  1. ดับเบิลคลิกที่ไฟล์ `CraftChat.exe`
  2. โปรแกรมจะเริ่มต้นการทำงานระบบ Serverless P2P ค้นหาเครื่องในวงแลน และเริ่มรับส่งข้อความ/สตรีมไฟล์ได้ทันที

---

## 🐧 2. Linux (`.AppImage`)
- **ไฟล์:** [`releases/linux/CraftChat-x86_64.AppImage`](linux/CraftChat-x86_64.AppImage)
- **ประเภท:** Universal Linux Standalone GUI Executable (SquashFS AppImage 4.3 MB)
- **คุณสมบัติ:** บรรจุทั้ง P2P Daemon Backend และ GUI Frontend (Vite/React) พร้อมเปิดหน้าต่าง Desktop App ทันที
- **วิธีใช้งาน:**
  1. ให้สิทธิ์ Execute:
     ```bash
     chmod +x releases/linux/CraftChat-x86_64.AppImage
     ```
  2. รันโปรแกรม (หรือดับเบิลคลิกจากตัวจัดการไฟล์):
     ```bash
     ./releases/linux/CraftChat-x86_64.AppImage
     ```
  3. *(กรณีระบบไม่ได้ติดตั้ง FUSE หรือบน Ubuntu 24.04):*
     ```bash
     ./releases/linux/CraftChat-x86_64.AppImage --appimage-extract-and-run
     ```

---

## 🍏 3. macOS (`.app`)
- **ไฟล์:** [`releases/macos/CraftChat.app`](macos/CraftChat.app) และ [`releases/macos/CraftChat-macOS.zip`](macos/CraftChat-macOS.zip)
- **ประเภท:** macOS Application Bundle
- **วิธีใช้งาน:**
  1. แตกไฟล์ `CraftChat-macOS.zip` จะได้โฟลเดอร์ `CraftChat.app`
  2. ลาก `CraftChat.app` ไปไว้ที่โฟลเดอร์ `/Applications` หรือดับเบิลคลิกเปิดใช้งานได้ทันที
