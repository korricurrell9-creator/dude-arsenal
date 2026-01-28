#!/system/bin/sh
# DUDE's Legacy HID Enabler (for older kernels like 3.18)

ANDROID_USB="/sys/class/android_usb/android0"

echo "[*] DUDE: Attempting Legacy Android USB Method..."

if [ ! -d "$ANDROID_USB" ]; then
    echo "[!] Legacy USB interface not found at $ANDROID_USB"
    exit 1
fi

echo "[*] Disabling USB..."
echo 0 > "$ANDROID_USB/enable"

echo "[*] Setting IDs..."
echo 04e8 > "$ANDROID_USB/idVendor" # Samsung
echo 6860 > "$ANDROID_USB/idProduct" # ADB + other stuff

echo "[*] Attempting to enable HID/Keyboard function..."
# Try 'hid' first, then 'keyboard'
echo "hid" > "$ANDROID_USB/functions" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "[!] 'hid' function rejected. Trying 'keyboard'..."
    echo "keyboard" > "$ANDROID_USB/functions" 2>/dev/null
    if [ $? -ne 0 ]; then
        echo "[!] 'keyboard' function rejected."
        echo "rndis,adb" > "$ANDROID_USB/functions"
        echo 1 > "$ANDROID_USB/enable"
        echo "[!!!] CRITICAL: This kernel does not support HID injection."
        echo "      You need a custom kernel (NetHunter or similar)."
        exit 1
    fi
fi

echo "[*] Re-enabling USB..."
echo 1 > "$ANDROID_USB/enable"

echo "[+] Legacy HID Mode ACTIVE (theoretically)."
echo "    Check /dev/hidg0 or /dev/hid* for the interface."
