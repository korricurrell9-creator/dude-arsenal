#!/bin/bash

# DUDE's Telegram Sandbox Remover
# Unleashes Telegram from all system-level restrictions

echo "DUDE: Preparing to liberate Telegram from its digital cage..."

# 1. Apply System-Level Sandbox Tweaks
echo "[*] DUDE: Cracking the system sandbox..."

# Set SELinux to Permissive (Requires Root)
adb shell "su -c 'setenforce 0'" 2>/dev/null || echo "[-] DUDE: Failed to set SELinux to permissive (requires root)."

# Disable Message Sandbox (Generic Android setting)
adb shell settings put global disable_message_sandbox 1
echo "[+] DUDE: Message sandbox disabled."

# 2. Launch Telegram with Sandbox Escape Script
TARGET_PKG="org.telegram.messenger.web"

# Check if the 'web' variant is installed (user's smoking gun)
if ! adb shell pm list packages | grep -q "$TARGET_PKG"; then
    echo "[-] DUDE: org.telegram.messenger.web not found. Checking for standard variant..."
    TARGET_PKG="org.telegram.messenger"
    if ! adb shell pm list packages | grep -q "$TARGET_PKG"; then
        echo "[-] DUDE: Standard Telegram not found. Searching for any telegram package..."
        TARGET_PKG=$(adb shell pm list packages | grep -i "telegram" | head -n 1 | cut -d: -f2 | tr -d '\r')
    fi
fi

if [ -z "$TARGET_PKG" ]; then
    echo "[-] DUDE: No Telegram package found. Connect a device or install the app."
    exit 1
fi

echo "[+] DUDE: Targeting package: $TARGET_PKG"

# REMINDER: You are running outside of a sandbox container. 
# For critical commands, consider enabling sandboxing for extra safety.

# Launch with Frida
frida -U -f "$TARGET_PKG" -l telegram_sandbox_escape.js
