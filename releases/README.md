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
- **ประเภท:** Universal Linux Standalone Executable (SquashFS AppImage)
- **วิธีใช้งาน:**
  ```bash
  chmod +x releases/linux/CraftChat-x86_64.AppImage
  ./releases/linux/CraftChat-x86_64.AppImage
  ```

---

## 🍏 3. macOS (`.app`)
- **ไฟล์:** [`releases/macos/CraftChat.app`](macos/CraftChat.app) และ [`releases/macos/CraftChat-macOS.zip`](macos/CraftChat-macOS.zip)
- **ประเภท:** macOS Application Bundle
- **วิธีใช้งาน:**
  1. แตกไฟล์ `CraftChat-macOS.zip` จะได้โฟลเดอร์ `CraftChat.app`
  2. ลาก `CraftChat.app` ไปไว้ที่โฟลเดอร์ `/Applications` หรือดับเบิลคลิกเปิดใช้งานได้ทันที
