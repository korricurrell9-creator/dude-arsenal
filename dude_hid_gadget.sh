#!/system/bin/sh
# DUDE's HID Gadget Enabler for Rooted Android (v2 - Robust)
# This script configures the USB controller to act as a Keyboard.

# Disable exit on error to handle checks manually
# set -e 

echo "[*] DUDE: Initializing HID Gadget (v2)..."

# 1. Locate ConfigFS
if [ -d "/sys/kernel/config/usb_gadget" ]; then
    CONFIGFS_HOME="/sys/kernel/config/usb_gadget"
    echo "[*] Found ConfigFS at /sys/kernel/config"
elif [ -d "/config/usb_gadget" ]; then
    CONFIGFS_HOME="/config/usb_gadget"
    echo "[*] Found ConfigFS at /config"
else
    echo "[!] ConfigFS not found. Attempting to mount..."
    mount -t configfs none /config 2>/dev/null
    if [ -d "/config/usb_gadget" ]; then
        CONFIGFS_HOME="/config/usb_gadget"
        echo "[*] Mounted ConfigFS at /config"
    elif [ -d "/sys/kernel/config/usb_gadget" ]; then
         CONFIGFS_HOME="/sys/kernel/config/usb_gadget"
         echo "[*] Found ConfigFS at /sys/kernel/config (after mount attempt)"
    else
        echo "[!!!] CRITICAL: Your kernel does not seem to support ConfigFS or USB Gadgets."
        echo "      Check if your kernel has CONFIG_USB_CONFIGFS enabled."
        exit 1
    fi
fi

GADGET_NAME="g1"
GADGET_PATH="$CONFIGFS_HOME/$GADGET_NAME"
echo "[*] Target Gadget Path: $GADGET_PATH"

# 2. Cleanup Old Gadget
if [ -d "$GADGET_PATH" ]; then
    echo "[!] Gadget already exists. Cleaning up..."
    echo "" > "$GADGET_PATH/UDC" 2>/dev/null || true
    rm -f "$GADGET_PATH/configs/b.1/f1" 2>/dev/null || true
    rmdir "$GADGET_PATH/configs/b.1/strings/0x409" 2>/dev/null || true
    rmdir "$GADGET_PATH/configs/b.1" 2>/dev/null || true
    rmdir "$GADGET_PATH/functions/hid.usb0" 2>/dev/null || true
    rmdir "$GADGET_PATH/strings/0x409" 2>/dev/null || true
    rmdir "$GADGET_PATH" 2>/dev/null || true
    echo "[*] Cleanup done (errors ignored)."
fi

# 3. Create Gadget
echo "[*] Creating Gadget directories..."
mkdir "$GADGET_PATH"
if [ $? -ne 0 ]; then
    echo "[!!!] Failed to create gadget directory. Is the filesystem read-only?"
    exit 1
fi

cd "$GADGET_PATH"

echo 0x1d6b > idVendor
echo 0x0104 > idProduct
echo 0x0100 > bcdDevice
echo 0x0200 > bcdUSB

mkdir strings/0x409
echo "fedcba9876543210" > strings/0x409/serialnumber
echo "DUDE" > strings/0x409/manufacturer
echo "BadUSB Keyboard" > strings/0x409/product

mkdir configs/b.1
mkdir configs/b.1/strings/0x409
echo "Config 1: HID" > configs/b.1/strings/0x409/configuration
echo 250 > configs/b.1/bmAttributes

# 4. Create HID Function
echo "[*] Configuring HID function..."
mkdir functions/hid.usb0
echo 1 > functions/hid.usb0/protocol
echo 1 > functions/hid.usb0/subclass
echo 8 > functions/hid.usb0/report_length
# Keyboard report descriptor
echo -ne '\x05\x01\x09\x06\xa1\x01\x05\x07\x19\xe0\x29\xe7\x15\x00\x25\x01\x75\x01\x95\x08\x81\x02\x95\x01\x75\x08\x81\x03\x95\x05\x75\x01\x05\x08\x19\x01\x29\x05\x91\x02\x95\x01\x75\x03\x91\x03\x95\x06\x75\x08\x15\x00\x25\x65\x05\x07\x19\x00\x29\x65\x81\x00\xc0' > functions/hid.usb0/report_desc

# 5. Link Function
ln -s functions/hid.usb0 configs/b.1/f1

# 6. Enable UDC
UDC_DEV=$(ls /sys/class/udc | head -n 1)
if [ -z "$UDC_DEV" ]; then
    echo "[!!!] No USB Device Controller (UDC) found in /sys/class/udc!"
    exit 1
fi

echo "[*] Binding to UDC: $UDC_DEV"
echo "$UDC_DEV" > UDC

echo "[+] DUDE: HID Gadget ACTIVE. Device should appear as a keyboard."
echo "[*] Use /dev/hidg0 to send keystrokes."