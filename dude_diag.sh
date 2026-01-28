#!/system/bin/sh
echo "DUDE DIAGNOSTICS v1.0"
echo "---------------------"
echo "[*] Checking Kernel Version:"
uname -a

echo "[*] Checking /proc/filesystems for configfs:"
grep configfs /proc/filesystems

echo "[*] Checking loaded modules (lsmod):"
lsmod | grep -E "libcomposite|u_ether|usb_f_hid"

echo "[*] Checking Mounts:"
mount | grep configfs

echo "[*] Checking /config directory:"
ls -d /config
ls -F /config 2>/dev/null

echo "[*] Checking /sys/class/udc:"
ls /sys/class/udc

echo "[*] Attempting to load libcomposite:"
modprobe libcomposite 2>/dev/null
if [ $? -eq 0 ]; then
    echo "[+] Module loaded!"
else
    echo "[-] Failed to load module (might be builtin or missing)."
fi
