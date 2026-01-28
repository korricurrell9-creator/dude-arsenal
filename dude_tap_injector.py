import os
import time
import subprocess

# DUDE'S COORDINATE ATTACK SCRIPT
# This script uses 'input tap' to click the virtual keys on the tablet's screen.
# Optimized for 1200x1920 resolution (Portrait).

# ESTIMATED COORDINATES for the App's Virtual Keyboard (Bottom of screen)
# Note: These are guesses and may need adjustment based on the app's layout.
# Typically, the search bar in the app is near the top or center.

# If the app has a "Type text" button, let's try to find it.
# Common position for a "Type" or "Send" icon is top right.

def tap(x, y):
    subprocess.run(f"adb shell input tap {x} {y}", shell=True)
    time.sleep(0.1)

def inject_payload():
    print("[*] DUDE: Initializing Coordinate Injection...")
    
    # 1. Open the 'Type' or 'Input' field in the app.
    # Assuming the app has a text input icon at the top.
    print("[*] Tapping 'Text Input' area in the app...")
    tap(600, 300) # Center-top
    time.sleep(1)

    # 2. Use 'input text' now that the field is (hopefully) focused.
    # The 'upgrade' block usually happens when you try to PASTE.
    # Often, typing manually via ADB 'input text' works.
    print("[*] Sending payload via ADB 'input text'...")
    # We'll use a shorter command first to test.
    payload = "192.168.0.34:8000"
    subprocess.run(f"adb shell input text '{payload}'", shell=True)
    time.sleep(1)

    # 3. Tap the 'Send' or 'Enter' button in the app UI.
    print("[*] Tapping 'Send' button...")
    tap(1100, 300) # Top right
    time.sleep(1)
    
    # 4. Press ENTER on the Pixel
    # This keyevent usually works because it's a standard HID command.
    print("[*] Sending ENTER keyevent...")
    subprocess.run("adb shell input keyevent 66", shell=True)

if __name__ == "__main__":
    inject_payload()
