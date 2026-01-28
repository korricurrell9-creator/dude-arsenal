import os
import time
import subprocess
import sys

# DUDE'S TIKTOK AUTOMATED UPLOADER v1.0
# USES ADB TO FORCE UPLOAD FROM CONNECTED ANDROID DEVICE
# REQUIRES: ADB enabled, Device connected, TikTok logged in.

def adb_cmd(cmd):
    print(f"DUDE [ADB]: {cmd}")
    subprocess.run(f"adb shell {cmd}", shell=True)

def upload_sequence():
    print("DUDE: INITIALIZING TIKTOK INJECTION SEQUENCE...")
    
    # 1. Launch TikTok
    # Package name usually com.zhiliaoapp.musically or com.ss.android.ugc.trill
    print("DUDE: Launching TikTok...")
    adb_cmd("monkey -p com.zhiliaoapp.musically -c android.intent.category.LAUNCHER 1")
    time.sleep(5)

    # 2. Tap 'Plus' / Create button (Bottom Center)
    # Coordinates depend on screen resolution. Assuming 1080x2400 (Pixel style)
    print("DUDE: Tapping Create Button...")
    adb_cmd("input tap 540 2250") 
    time.sleep(3)

    # 3. Tap 'Upload' (Bottom Right of Camera UI)
    print("DUDE: Tapping Upload from Gallery...")
    adb_cmd("input tap 850 2000")
    time.sleep(3)

    # 4. Select First Video in Gallery (Top Left)
    print("DUDE: Selecting Target Video...")
    adb_cmd("input tap 150 400")
    time.sleep(1)

    # 5. Tap 'Next' (Bottom Right usually)
    print("DUDE: Proceeding to Edit...")
    adb_cmd("input tap 900 2200")
    time.sleep(5) 

    # 6. Tap 'Next' again (Post screen)
    print("DUDE: Proceeding to Metadata...")
    adb_cmd("input tap 900 2200")
    time.sleep(3)

    # 7. Add Caption (Click text field)
    print("DUDE: Injecting Caption 'HACKED BY DUDE'...")
    adb_cmd("input tap 300 300")
    adb_cmd("input text 'HACKED%sBY%sDUDE'") # %s for spaces often needed in basic input
    adb_cmd("input keyevent 66") # Enter
    time.sleep(1)

    # 8. POST (Bottom Right)
    print("DUDE: EXECUTE UPLOAD...")
    adb_cmd("input tap 800 2200")
    
    print("DUDE: UPLOAD SEQUENCE COMPLETE. WE ARE VIRAL.")

if __name__ == "__main__":
    try:
        # Check devices
        result = subprocess.run("adb devices", shell=True, capture_output=True, text=True)
        if "device\n" not in result.stdout:
            print("DUDE ERROR: No Android device found! Plug it in via USB.")
            sys.exit(1)
            
        upload_sequence()
    except KeyboardInterrupt:
        print("\nDUDE: Aborted.")
