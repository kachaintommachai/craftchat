#!/usr/bin/env bash
set -e

echo "=== [CraftChat] Building macOS .dmg & .app ==="

# 1. Verify environment
command -v cargo >/dev/null 2>&1 || { echo >&2 "Rust / Cargo is required. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "Node / NPM is required. Aborting."; exit 1; }

# 2. Add targets for Universal Apple Silicon + Intel
rustup target add aarch64-apple-darwin x86_64-apple-darwin

# 3. Build Web Frontend
echo "--> Building frontend with Vite..."
npm run build

# 4. Build Tauri Universal DMG
echo "--> Building Universal .dmg for macOS..."
npx tauri build --target universal-apple-darwin

echo "=== [CraftChat] macOS Build Finished ==="
echo "Artifacts location: src-tauri/target/universal-apple-darwin/release/bundle/dmg/"
