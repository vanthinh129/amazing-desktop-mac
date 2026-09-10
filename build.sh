#!/bin/bash

# ==============================================================================
# AmazingDesktop Mac - Build & Bundle Script
# ==============================================================================

set -e

APP_NAME="AmazingDesktop"
BUNDLE_NAME="${APP_NAME}.app"
BUILD_DIR="build"

echo "🚀 Building AmazingDesktop Mac executable..."

# 1. Compile Swift sources using swiftc
swiftc -O -framework Cocoa -framework WebKit \
    src/DesktopWallpaperWindow.swift \
    src/WallpaperViewController.swift \
    src/main.swift \
    -o "${APP_NAME}"

echo "✅ Compiled binary '${APP_NAME}' successfully."

# 2. Package into macOS .app bundle
echo "📦 Packaging into macOS bundle '${BUNDLE_NAME}'..."
mkdir -p "${BUNDLE_NAME}/Contents/MacOS"
mkdir -p "${BUNDLE_NAME}/Contents/Resources"

# Copy binary to bundle MacOS folder
cp "${APP_NAME}" "${BUNDLE_NAME}/Contents/MacOS/${APP_NAME}"

# Copy web app resources to bundle Resources folder
rm -rf "${BUNDLE_NAME}/Contents/Resources/web"
cp -R web "${BUNDLE_NAME}/Contents/Resources/web"

# Create Info.plist for macOS bundle metadata & Microphone Usage Description
cat <<EOF > "${BUNDLE_NAME}/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>${APP_NAME}</string>
    <key>CFBundleIdentifier</key>
    <string>com.amazingdesktop.mac</string>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>12.0</string>
    <key>LSUIElement</key>
    <true/>
    <key>NSMicrophoneUsageDescription</key>
    <string>AmazingDesktop cần quyền Microphone để nhân vật AI có thể lắng nghe giọng nói của bạn.</string>
</dict>
</plist>
EOF

echo "🎉 Build Complete! You can run AmazingDesktop by running:"
echo "   open ${BUNDLE_NAME}"
echo "   or execute binary: ./${APP_NAME}"
