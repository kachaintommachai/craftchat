#!/usr/bin/env bash
set -e

echo "=== [CraftChat] Installing Linux Desktop Entry and Assets ==="

INSTALL_DIR="${HOME}/.local/bin"
DESKTOP_DIR="${HOME}/.local/share/applications"
ICON_DIR="${HOME}/.local/share/icons/hicolor/512x512/apps"

mkdir -p "${INSTALL_DIR}"
mkdir -p "${DESKTOP_DIR}"
mkdir -p "${ICON_DIR}"

# 1. Install icon
if [ -f "src-tauri/icons/icon.png" ]; then
  cp "src-tauri/icons/icon.png" "${ICON_DIR}/craftchat.png"
  echo "✔ Installed icon to ${ICON_DIR}/craftchat.png"
fi

# 2. Install desktop shortcut
if [ -f "craftchat.desktop" ]; then
  cp "craftchat.desktop" "${DESKTOP_DIR}/craftchat.desktop"
  chmod +x "${DESKTOP_DIR}/craftchat.desktop"
  echo "✔ Installed launcher to ${DESKTOP_DIR}/craftchat.desktop"
fi

# 3. Install daemon binary if present
if [ -f "dist-bin/craft-chat-daemon" ]; then
  cp "dist-bin/craft-chat-daemon" "${INSTALL_DIR}/craft-chat-daemon"
  chmod +x "${INSTALL_DIR}/craft-chat-daemon"
  echo "✔ Installed craft-chat-daemon to ${INSTALL_DIR}/craft-chat-daemon"
fi

echo "=== [CraftChat] Installation Complete ==="
