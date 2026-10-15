#!/usr/bin/env bash
set -e

echo "=== [CraftChat] Building Linux Binaries & Bundles ==="

# 1. Check prerequisites
command -v cargo >/dev/null 2>&1 || { echo >&2 "Rust / Cargo is required. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "Node / NPM is required. Aborting."; exit 1; }

# 2. Build Frontend UI
echo "--> Building frontend with Vite..."
npm run build

# 3. Build Core Daemon / Headless Service
echo "--> Compiling craft-chat-core headless daemon..."
cargo build --release -p craft-chat-core
mkdir -p dist-bin
cp target/release/daemon dist-bin/craft-chat-daemon
echo "✔ Saved headless daemon to dist-bin/craft-chat-daemon"

# 4. Build Tauri GUI Bundle (Debian .deb & AppImage)
if pkg-config --exists webkit2gtk-4.1 2>/dev/null; then
  echo "--> webkit2gtk-4.1 detected. Building Tauri desktop app (.deb & .AppImage)..."
  npx tauri build
  echo "✔ Desktop bundles generated in src-tauri/target/release/bundle/"
else
  echo "ℹ Note: webkit2gtk-4.1-dev is not detected locally."
  echo "  To build the GUI .deb and .AppImage packages locally on Debian/Ubuntu, run:"
  echo "    sudo apt-get install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf"
  echo "    npx tauri build"
  echo "  Alternatively, push to GitHub to build automatically via GitHub Actions."
fi

echo "=== [CraftChat] Linux Build Finished ==="
