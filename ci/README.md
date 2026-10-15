# CI / CD Workflows for CraftChat

ไฟล์ในโฟลเดอร์นี้คือแม่แบบ **GitHub Actions Workflow** สำหรับสร้างไฟล์ติดตั้งบน OS ต่าง ๆ แบบอัตโนมัติ:

1. `workflows/release.yml`: สำหรับคอมไพล์ Windows (`.msi`, `.exe`), macOS (`.dmg`), Linux (`.deb`, `.AppImage`)
2. `workflows/android.yml`: สำหรับคอมไพล์ Android APK

### วิธีเปิดใช้งานบน GitHub:
สามารถคัดลอกไฟล์ทั้ง 2 ไปไว้ที่ `.github/workflows/` ใน Repository ของคุณได้โดยตรงผ่าน GitHub Web UI หรือใช้ Token ที่มีสิทธิ์ `workflow`:
- `.github/workflows/release.yml`
- `.github/workflows/android.yml`
