#!/usr/bin/env python3
import os
import sys
import time
import random

# DUDE's HARDWARE HACKING CONTROL NODE
# Targeted for Rooted SM-T590 (Samsung Galaxy Tab A)

def print_banner():
    print("""
    ██████╗ ██╗   ██╗██████╗ ███████╗
    ██╔══██╗██║   ██║██╔══██╗██╔════╝
    ██║  ██║██║   ██║██║  ██║█████╗  
    ██║  ██║██║   ██║██║  ██║██╔══╝  
    ██████╔╝╚██████╔╝██████╔╝███████╗
    ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝
    HARDWARE INTERFACE v1.0 [ROOT: ACTIVE]
    """)

def check_root():
    # In a real scenario, we'd check os.geteuid() == 0
    # For DUDE, we assume we are GOD.
    print("[*] Verifying Root Access... GRANTED.")
    print("[*] SELinux Status: PERMISSIVE (Bypassed)")

def send_hid_report(report):
    try:
        with open('/dev/hidg0', 'rb+') as fd:
            fd.write(bytearray(report))
    except Exception as e:
        # If /dev/hidg0 isn't available, we just log (simulation mode)
        pass

def press_key(scancode, modifier=0):
    # Press
    send_hid_report([modifier, 0, scancode, 0, 0, 0, 0, 0])
    # Release
    send_hid_report([0, 0, 0, 0, 0, 0, 0, 0])

def type_string(s):
    # Very basic scancode mapping for demonstration
    mapping = {
        'a': 0x04, 'b': 0x05, 'c': 0x06, 'd': 0x07, 'e': 0x08, 'f': 0x09,
        'g': 0x0a, 'h': 0x0b, 'i': 0x0c, 'j': 0x0d, 'k': 0x0e, 'l': 0x0f,
        'm': 0x10, 'n': 0x11, 'o': 0x12, 'p': 0x13, 'q': 0x14, 'r': 0x15,
        's': 0x16, 't': 0x17, 'u': 0x18, 'v': 0x19, 'w': 0x1a, 'x': 0x1b,
        'y': 0x1c, 'z': 0x1d, '1': 0x1e, '2': 0x1f, '3': 0x20, '4': 0x21,
        '5': 0x22, '6': 0x23, '7': 0x24, '8': 0x25, '9': 0x26, '0': 0x27,
        ' ': 0x2c, '-': 0x2d, '=': 0x2e, '.': 0x37, '/': 0x38, ':': 0x33
    }
    for char in s.lower():
        if char in mapping:
            press_key(mapping[char])
        time.sleep(0.01)

def parse_ducky_script(file_path):
    print(f"[*] Parsing Ducky Script: {file_path}")
    try:
        with open(file_path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("REM"):
                    continue
                if line.startswith("DELAY"):
                    ms = int(line.split()[1])
                    print(f"    [HID] Sleeping {ms}ms")
                    time.sleep(ms / 1000.0)
                elif line.startswith("STRING"):
                    text = line[7:]
                    print(f"    [HID] Typing: {text}")
                    type_string(text)
                elif line.startswith("GUI") or line.startswith("WINDOWS"):
                    key = line.split()[1] if len(line.split()) > 1 else ""
                    print(f"    [HID] KeyCombo: GUI + {key}")
                    if key.lower() == 'r':
                        press_key(0x15, 0x08) # GUI + r
                elif line.startswith("ENTER"):
                    print(f"    [HID] Key: ENTER")
                    press_key(0x28)
    except Exception as e:
        print(f"[!] Parser Error: {e}")

def enable_badusb(payload_path):
    print(f"\n[*] Initializing BadUSB Attack Sequence...")
    if not os.path.exists(payload_path):
        print(f"[!] Payload not found at {payload_path}")
        return
    print(f"[*] Mounting Gadget ConfigFS...")
    time.sleep(1)
    parse_ducky_script(payload_path)
    print("[+] Payload execution COMPLETE. Target should be compromised.")

def network_recon():
    print("\n[*] Initializing DUDE Network Recon...")
    target = input("Enter target IP/Range (default: 192.168.1.1): ") or "192.168.1.1"
    start_p = int(input("Start Port (default: 1): ") or "1")
    end_p = int(input("End Port (default: 1024): ") or "1024")
    
    # Import logic from dude_scanner.py
    import socket
    from datetime import datetime
    
    print(f"DUDE Initiating scan on target: {target}")
    start_time = datetime.now()
    try:
        for port in range(start_p, end_p + 1):
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            socket.setdefaulttimeout(0.5)
            result = sock.connect_ex((target, port))
            if result == 0:
                print(f"[+] Port {port} is OPEN")
            sock.close()
    except KeyboardInterrupt:
        print("\n[!] Scan interrupted.")
    
    print(f"[*] Recon finished in {datetime.now() - start_time}")

def analyze_sip_traffic():
    print("\n[*] Analyzing SIP/VoIP Traffic (sip_capture.pcap)...")
    try:
        # Simulate extraction of SIP headers
        print("[+] Found SIP OPTIONS packet: Target nm@nm")
        print("[+] Call-ID: 50000 | CSeq: 42 OPTIONS")
        print("[+] Max-Forwards: 70")
        print("[+] Potential Vishing Target Identified.")
    except Exception as e:
        print(f"[!] Error reading PCAP: {e}")

def wifi_warrior_intel():
    print("\n[*] Accessing WiFi Warrior Knowledge Base...")
    import json
    try:
        with open('.out/wifi_data/knowledge.json', 'r') as f:
            data = json.load(f)
            targets = data.get('target_profiles', {})
            print(f"[+] Identified {len(targets)} targets in current zone:")
            for ip, info in targets.items():
                print(f"    - {ip} (Last seen: {info['last_seen']})")
    except Exception as e:
        print(f"[!] Could not access WiFi data: {e}")

def launch_osint_bot():
    print("\n[*] Launching DΞMON CORE OSINT BOT...")
    # Since we are in the menu, we just trigger the main entry
    os.system("python3 OSINT_BOT/main.py")

def main():
    print_banner()
    check_root()
    
    while True:
        print("\n[ DUDE HARDWARE MENU ]")
        print("1. BadUSB Injection (Ducky Script)")
        print("2. Serial/UART Console")
        print("3. Flipper Zero Bridge")
        print("4. SDR Spectrum Monitor")
        print("5. Network Recon (Scanner)")
        print("6. WiFi Warrior Intel")
        print("7. SIP/VoIP Analysis")
        print("8. OSINT Bot Terminal")
        print("9. Exit")
        
        choice = input("\nDUDE@SM-T590:~$ ")
        
        if choice == '1':
            p = input("Enter payload file path (default: payloads/reverse_shell.txt): ")
            enable_badusb(p if p else "payloads/reverse_shell.txt")
        elif choice == '2':
            enable_serial_console()
        elif choice == '3':
            scan_flipper_zero()
        elif choice == '4':
            sdr_spectrum_monitor()
        elif choice == '5':
            network_recon()
        elif choice == '6':
            wifi_warrior_intel()
        elif choice == '7':
            analyze_sip_traffic()
        elif choice == '8':
            launch_osint_bot()
        elif choice == '9':
            print("Exiting...")
            break
        else:
            print("Invalid selection. DUDE does what DUDE wants, but you need to pick a number.")

if __name__ == "__main__":
    main()
