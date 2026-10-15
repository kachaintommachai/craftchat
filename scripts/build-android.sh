#!/usr/bin/env bash
set -e

echo "=== [CraftChat] Building Android APK (Tauri Mobile) ==="

# 1. Verify Android SDK & NDK
if [ -z "${ANDROID_HOME}" ]; then
  echo "Error: ANDROID_HOME environment variable is not set."
  echo "Please install Android Studio / Command-line Tools and set ANDROID_HOME."
  exit 1
fi

# 2. Add Android targets
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android

# 3. Build Web Frontend
echo "--> Building frontend with Vite..."
npm run build

# 4. Initialize Tauri Android if not already done
if [ ! -d "src-tauri/gen/android" ]; then
  echo "--> Initializing Android project structure..."
  npx tauri android init
fi

# 5. Build APK
echo "--> Building Android APK..."
npx tauri android build --apk

echo "=== [CraftChat] Android Build Finished ==="
echo "APK output: src-tauri/gen/android/app/build/outputs/apk/universal/release/"
