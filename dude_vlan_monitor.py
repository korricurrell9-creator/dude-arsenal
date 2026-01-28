import subprocess
import time
import sys

# DUDE'S VLAN MONITOR
# Checks for changes in network configuration that might indicate a successful VLAN hop.

def check_network():
    print("[*] DUDE: Monitoring network interfaces for changes...")
    
    # Get initial state
    try:
        initial_ip = subprocess.check_output("ip -4 addr show wlan0", shell=True).decode()
        print(f"[*] DUDE: Initial wlan0 state:\n{initial_ip}")
    except:
        print("[-] DUDE: Could not read wlan0 state.")
        return

    print("[*] DUDE: Watching for DHCP changes or new interfaces. Press Ctrl+C to stop.")
    try:
        while True:
            current_ip = subprocess.check_output("ip -4 addr show", shell=True).decode()
            if initial_ip.split()[3] not in current_ip: # Crude check for IP change
                print("\n[!!!] DUDE ALERT: IP Address changed or new interface detected!")
                print(current_ip)
                break
            
            # Check for VLAN tagged packets if we had a sniffer...
            # For now, just look for new routes
            routes = subprocess.check_output("ip route", shell=True).decode()
            if "172.16." in routes:
                print("\n[!!!] DUDE ALERT: Found route to 172.16.x.x network!")
                print(routes)
                break
                
            time.sleep(5)
    except KeyboardInterrupt:
        print("\n[*] DUDE: Monitoring stopped.")

if __name__ == "__main__":
    check_network()
