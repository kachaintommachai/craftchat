# CraftChat Windows Build Script (PowerShell)
# Requires: Node.js 18+, Rust (rustup), and Microsoft C++ Build Tools

Write-Host "=== [CraftChat] Building Windows .msi and .exe ===" -ForegroundColor Green

# 1. Install / Verify NPM packages
Write-Host "--> Installing NPM dependencies..." -ForegroundColor Cyan
npm ci

# 2. Build Web Frontend
Write-Host "--> Building frontend with Vite..." -ForegroundColor Cyan
npm run build

# 3. Build Core Daemon
Write-Host "--> Building core daemon for Windows..." -ForegroundColor Cyan
cargo build --release -p craft-chat-core

# 4. Build Tauri GUI Bundles (.msi and .exe)
Write-Host "--> Building Tauri GUI installer (.msi & .exe)..." -ForegroundColor Cyan
npx tauri build

Write-Host "=== [CraftChat] Windows Build Finished ===" -ForegroundColor Green
Write-Host "Artifacts location: src-tauri\target\release\bundle\msi\ and bundle\nsis\" -ForegroundColor Yellow
