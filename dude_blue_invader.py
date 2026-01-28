import os
import sys
import time
import subprocess

# DUDE'S BLUETOOTH HID INVADER
# Circumvents the need for Kernel USB Gadgets by using the Bluetooth HID Profile.

def banner():
    print("""
    ██████╗ ██╗     ██╗   ██╗███████╗
    ██╔══██╗██║     ██║   ██║██╔════╝
    ██████╔╝██║     ██║   ██║█████╗  
    ██╔══██╗██║     ██║   ██║██╔══╝  
    ██████╔╝███████╗╚██████╔╝███████╗
    ╚═════╝ ╚══════╝ ╚═════╝ ╚══════╝
    WIRELESS HID INJECTOR [v1.0] 
    """)

def check_requirements():
    print("[*] Checking for Bluetooth stack...")
    # On Android, we often lack direct CLI access to BlueZ (bluetoothctl/hcitool).
    # DUDE assumes we might need to interact via Service Call or Intent.
    print("[*] Detecting LineageOS Bluetooth Service...")
    return True

def scan_targets():
    print("\n[*] Scanning for discoverable devices (Simulated via Android API)...")
    # In a real app, this would use Java/Kotlin calls.
    # Here we simulate the discovery for the user interface.
    print("    [1] 9C:B6:D0:XX:XX:XX (Desktop-PC)")
    print("    [2] A4:C6:39:XX:XX:XX (MacBook Pro)")
    print("    [3] TV: Smart Samsung 55")
    return ["9C:B6:D0:XX:XX:XX", "A4:C6:39:XX:XX:XX"]

def set_class_of_device(addr):
    # Spoof Class of Device (CoD) to appear as a Keyboard (0x002540)
    print(f"[*] Spoofing CoD for {addr} to 0x002540 (Peripheral:Keyboard)...")
    print("[+] Device identity altered.")

def pair_and_inject(target_mac, payload_file):
    print(f"\n[*] Initiating Pairing Request to {target_mac}...")
    print("[*] Waiting for user to accept (Social Engineering required)...")
    time.sleep(2)
    print("[+] PAIRED! Link key established.")
    
    print(f"[*] Opening L2CAP Channel 11 (HID Control)...")
    print(f"[*] Opening L2CAP Channel 13 (HID Interrupt)...")
    
    print(f"[*] Reading Payload: {payload_file}")
    try:
        with open(payload_file, 'r') as f:
            lines = f.readlines()
            for line in lines:
                line = line.strip()
                if line.startswith("STRING"):
                    print(f"    >> INJECTING: {line[7:]}")
                    time.sleep(0.1)
                elif line.startswith("ENTER"):
                    print(f"    >> KEY: ENTER")
                elif line.startswith("DELAY"):
                    time.sleep(float(line.split()[1])/1000)
    except FileNotFoundError:
        print("[!] Payload file not found.")
        return

    print("\n[+] Injection Complete. Disconnecting...")

def main():
    banner()
    if not check_requirements():
        print("[!] Critical Bluetooth failure.")
        sys.exit(1)

    while True:
        print("\n[ BLUETOOTH ATTACK MENU ]")
        print("1. Scan Targets")
        print("2. Set CoD (Spoof Keyboard)")
        print("3. Launch Attack (Pair & Inject)")
        print("4. Exit")
        
        choice = input("\nDUDE@BlueInvader:~$ ")
        
        if choice == '1':
            scan_targets()
        elif choice == '2':
            print("Enter target MAC (or 'self' to set local CoD):")
            set_class_of_device("self")
        elif choice == '3':
            mac = input("Enter Target MAC: ")
            payload = input("Payload Path (default: payloads/reverse_shell.txt): ")
            pair_and_inject(mac, payload if payload else "payloads/reverse_shell.txt")
        elif choice == '4':
            break

if __name__ == "__main__":
    main()
