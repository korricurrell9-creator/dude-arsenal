#!/bin/bash

# DUDE's YouTube Patcher & Pusher v2
# Robust installation and logic injection for non-GMS tablets.

echo "DUDE: Preparing to deploy YouTube Premium logic..."

# 1. Target Package
TARGET_PKG="com.google.android.youtube"

# 2. Locate Compatible APKs
DOWNLOADS_DIR="/home/korri/Downloads"
CURRENT_DIR="$(pwd)"
NEW_YOUTUBE="$DOWNLOADS_DIR/youtube-21-03-36.apk"
[ ! -f "$NEW_YOUTUBE" ] && NEW_YOUTUBE="$CURRENT_DIR/youtube-21-03-36.apk"

if [ -f "$NEW_YOUTUBE" ]; then
    echo "[+] DUDE: Found standalone YouTube APK in Downloads: youtube-21-03-36.apk"
    echo "[*] DUDE: Pushing standalone APK to device storage..."
    REMOTE_APK="/data/local/tmp/youtube_install.apk"
    adb push "$NEW_YOUTUBE" "$REMOTE_APK"
    
    if [ $? -eq 0 ]; then
        echo "[*] DUDE: Executing remote install..."
        # Force install, allow downgrade, allow test packages
        adb shell "pm install -r -d -t \"$REMOTE_APK\""
        if [ $? -eq 0 ]; then
            echo "[+] DUDE: YouTube installed successfully."
            adb shell "rm \"$REMOTE_APK\""
        else
            echo "[!] DUDE: Standard remote install failed. Attempting with ROOT (su)..."
            adb shell "su -c 'pm install -r -d -t \"$REMOTE_APK\"'"
            if [ $? -eq 0 ]; then
                echo "[+] DUDE: YouTube (ROOT) installed successfully."
                adb shell "rm \"$REMOTE_APK\""
            else
                echo "[-] DUDE: Remote installation failed even with su."
                exit 1
            fi
        fi
    else
        echo "[-] DUDE: Failed to push APK to device."
        exit 1
    fi
else
    # Fallback architecture-aware split install
    echo "[*] DUDE: Standalone APK not found. Checking for compatible splits..."
    ABI=$(adb shell getprop ro.product.cpu.abi | tr -d '\r')
    ABI_UNDERSCORE=$(echo "$ABI" | tr '-' '_')

    if [ -f "/home/korri/base.apk" ] && { [ -f "/home/korri/split_config.$ABI.apk" ] || [ -f "/home/korri/split_config.$ABI_UNDERSCORE.apk" ]; }; then
        # ... (split install logic) 
        echo "[+] DUDE: Found compatible split APKs in home directory!"
        TEMP_DIR="/home/korri/youtube_temp"
        mkdir -p "$TEMP_DIR"
        cp "/home/korri/base.apk" "$TEMP_DIR/"
        [ -f "/home/korri/split_config.$ABI.apk" ] && cp "/home/korri/split_config.$ABI.apk" "$TEMP_DIR/" || cp "/home/korri/split_config.$ABI_UNDERSCORE.apk" "$TEMP_DIR/"
        
        # Create a remote directory
        REMOTE_DIR="/data/local/tmp/youtube_install"
        adb shell "mkdir -p $REMOTE_DIR"
        for apk in "$TEMP_DIR"/*.apk; do
            adb push "$apk" "$REMOTE_DIR/$(basename "$apk")"
        done
        
        adb shell "pm install-create -r -d -t" > /tmp/session_res
        SESSION_ID=$(grep -oE '[0-9]+' /tmp/session_res | head -n 1)
        
        index=0
        for apk in "$TEMP_DIR"/*.apk; do
            filesize=$(stat -c%s "$apk")
            adb shell "pm install-write -S $filesize $SESSION_ID $index \"$REMOTE_DIR/$(basename \"$apk\")\""
            index=$((index + 1))
        done
        
        adb shell "pm install-commit $SESSION_ID"
        echo "[+] DUDE: YouTube Bundle ($ABI) installed."
        adb shell "rm -rf $REMOTE_DIR"
        rm -rf "$TEMP_DIR"
    else
        echo "[-] DUDE: No compatible YouTube files found."
        exit 1
    fi
fi

# 4. Check if package is present
if ! adb shell pm list packages | grep -q "$TARGET_PKG"; then
    echo "[-] DUDE: YouTube ($TARGET_PKG) not found on device."
    exit 1
fi

# 5. Unleash with Frida
echo "[*] DUDE: Injecting Premium logic into YouTube..."
frida -U -f "$TARGET_PKG" -l youtube_premium_unlock.js
