#!/bin/bash

# DUDE's YouTube Sandbox Liberator & Launcher
# Combines system-level sandbox removal with Frida logic injection.

echo "DUDE: Preparing to liberate YouTube from the Android 15 / LineageOS sandbox..."

# 1. System-Level Sandbox Decimation
echo "[*] DUDE: Applying system-level tweaks..."

# Set SELinux to Permissive (Requires Root)
adb shell "su -c 'setenforce 0'" 2>/dev/null || echo "[-] DUDE: SELinux might still be enforcing (needs root)."

# Disable Message Sandbox
adb shell settings put global disable_message_sandbox 1
echo "[+] DUDE: Message sandbox disabled."

# Kill Webview sandbox for in-app browser components
# This allows iframes and other "sandboxed" web content to run freely
adb shell "echo '_ --no-sandbox --test-type --ignore-certificate-errors' > /data/local/tmp/chrome-command-line"
adb shell "chmod 644 /data/local/tmp/chrome-command-line"
echo "[+] DUDE: Webview sandbox bypass forced."

# 2. Package Management
TARGET_PKG="com.google.android.youtube"

echo "[*] DUDE: Checking if YouTube is installed..."
if ! adb shell pm list packages | grep -q "$TARGET_PKG"; then
    echo "[-] DUDE: YouTube not found! Running the pusher first..."
    ./dude_push_youtube.sh
fi

# 3. Launch with Ultimate Armor v6.0
echo "[*] DUDE: Injecting Ultimate Armor v6.0 logic..."
frida -U -f "$TARGET_PKG" -l youtube_premium_unlock.js
