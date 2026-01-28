#!/bin/bash

# DUDE's GMS / Google Play Installer
# Liberates your device by injecting the Google core or its superior microG alternative.

echo "DUDE: Preparing to force-feed Google Play Services to this tablet..."

# 1. Check for Root
if ! adb shell "su -c 'id'" | grep -q "uid=0"; then
    echo "[!] DUDE: Warning! Root (su) not detected or permission denied."
    echo "    (Some GMS components require system-level injection. Proceeding with standard install...)"
fi

# 2. Define Components (microG - The Smarter Way)
# Using verified stable links
COMPONENTS=(
    "https://github.com/microg/GmsCore/releases/download/v0.3.12.250932/com.google.android.gms-250932024.apk"
    "https://github.com/microg/GsfProxy/releases/download/v0.1.0/GsfProxy.apk"
    "https://github.com/microg/GmsCore/releases/download/v0.3.12.250932/com.android.vending-84022624.apk"
)

TEMP_DIR="/home/korri/gms_install"
mkdir -p "$TEMP_DIR"

echo "[*] DUDE: Downloading GMS alternatives (microG)..."
for url in "${COMPONENTS[@]}"; do
    filename=$(basename "$url")
    echo "  - Downloading $filename..."
    # Use -L to follow redirects and --fail to exit on error
    curl -L --fail "$url" -o "$TEMP_DIR/$filename"
    
    # Check if download actually worked (files should be > 10KB)
    filesize=$(stat -c%s "$TEMP_DIR/$filename" 2>/dev/null || echo 0)
    if [ "$filesize" -lt 10240 ]; then
        echo "[!] DUDE: Download failed or file too small ($filesize bytes). Check your internet connection."
        rm "$TEMP_DIR/$filename"
    fi
done

# Check if we have anything to install
if [ -z "$(ls -A "$TEMP_DIR"/*.apk 2>/dev/null)" ]; then
    echo "[-] DUDE: No valid components downloaded. Aborting."
    exit 1
fi

# 3. Push and Install
echo "[*] DUDE: Pushing components to device..."
REMOTE_TEMP="/data/local/tmp/gms_force"

adb shell "mkdir -p $REMOTE_TEMP"

for apk in "$TEMP_DIR"/*.apk; do
    filename=$(basename "$apk")
    echo "  - Pushing $filename..."
    adb push "$apk" "$REMOTE_TEMP/$filename"
    
    echo "  - Installing $filename..."
    # Install as system app if possible, else standard install
    # Added --bypass-low-target-sdk-block for Android 14+
    adb shell "su -c 'pm install -r -d -t --bypass-low-target-sdk-block \"$REMOTE_TEMP/$filename\"'" || adb shell "pm install -r -d -t --bypass-low-target-sdk-block \"$REMOTE_TEMP/$filename\""
done

# 4. Finalizing
echo "[*] DUDE: Cleaning up..."

adb shell "rm -rf $REMOTE_TEMP"
rm -rf "$TEMP_DIR"

echo "[+] DUDE: GMS / microG injection complete."
echo "[!] IMPORTANT: Open microG Settings on the tablet and ENABLE 'Google Device Registration' and 'Cloud Messaging'."
echo "[!] Then, try launching YouTube again with: ./dude_push_youtube.sh"
