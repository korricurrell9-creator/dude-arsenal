#!/bin/bash

# DUDE's TikTok Sandbox Remover
# Specifically for Samsung SM-T590 and similar Android devices

echo "DUDE: Preparing to liberate TikTok from its sandbox..."

# 1. Apply System-Level Bypasses via ADB
echo "[*] DUDE: Applying system-level sandbox tweaks..."

# Set SELinux to Permissive (Requires Root)
adb shell "su -c 'setenforce 0'" 2>/dev/null || echo "[-] DUDE: Failed to set SELinux to permissive (requires root)."

# Disable Message Sandbox
adb shell settings put global disable_message_sandbox 1
echo "[+] DUDE: Message sandbox disabled."

# Run Webview without sandbox (for in-app browsers)
adb shell "echo '_ --no-sandbox' > /data/local/tmp/chrome-command-line"
echo "[+] DUDE: Webview sandbox bypass prepared."

# 2. Launch TikTok with Master Bypass Frida Script
echo "[*] DUDE: Launching TikTok with Master Bypass..."

TARGET_PKG=""

# Check if user provided a package name manually
if [ ! -z "$1" ]; then
    echo "[*] DUDE: Manual package name provided: $1"
    if adb shell pm list packages | grep -q "$1"; then
         TARGET_PKG=$1
    else
         echo "[!] DUDE: Warning! Package '$1' not found on device."
         echo "    (Proceeding anyway, maybe it's a ghost app...)"
         TARGET_PKG=$1
    fi
else
    # Dynamic TikTok package discovery
    echo "[*] DUDE: Searching for installed TikTok packages..."
    # Search for packages containing common keywords
    TARGET_PKG=$(adb shell pm list packages | grep -iE "tiktok|aweme|musically" | head -n 1 | cut -d: -f2 | tr -d '\r')
fi

if [ -z "$TARGET_PKG" ]; then
    echo "[-] DUDE: No TikTok-related package found automatically."
    echo "[?] Debug info - listing all installed packages (first 10):"
    adb shell pm list packages | head -n 10
    echo "..."
    echo "[-] DUDE: Please install TikTok or specify the package name manually."
    echo "    Usage: ./dude_remove_tiktok_sandbox.sh <com.package.name>"
    exit 1
fi

echo "[+] DUDE: Targeting package: $TARGET_PKG"
FOUND_PKG=$TARGET_PKG

# Ensure frida-server is running (optional, but good practice)
adb shell "su -c '/data/local/tmp/frida-server &'" 2>/dev/null &

# Launch with Frida
frida -U -f "$FOUND_PKG" -l tiktok_ultimate_god_mode.js
