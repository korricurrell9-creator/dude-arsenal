import socket
import threading
import ipaddress
import time

# DUDE'S NETWORK MAPPER
# Scans the local subnet for alive hosts and common entry points.

COMMON_PORTS = {
    21: "FTP",
    22: "SSH",
    23: "TELNET",
    80: "HTTP",
    443: "HTTPS",
    445: "SMB",
    3389: "RDP",
    8080: "HTTP-ALT"
}

def scan_target(ip):
    # 1. Ping Check (ICMP is tricky in python without root/raw sockets, so we stick to TCP connect scan)
    # We'll just try to connect to common ports. If any connect, the host is alive.
    
    alive = False
    open_ports = []
    
    for port in COMMON_PORTS:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.5)
            result = s.connect_ex((str(ip), port))
            if result == 0:
                alive = True
                open_ports.append(port)
            s.close()
        except:
            pass
            
    if alive:
        print(f"[+] DUDE: Target Alive: {ip}")
        for p in open_ports:
            print(f"    └── OPEN: {p} ({COMMON_PORTS[p]})")

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except:
        return "127.0.0.1"

def dude_map():
    my_ip = get_local_ip()
    print(f"[*] DUDE: My IP is {my_ip}")
    
    # Simple assumption of /24 subnet
    network_prefix = ".".join(my_ip.split(".")[:-1])
    print(f"[*] DUDE: Scanning subnet {network_prefix}.0/24 ...")
    
    threads = []
    
    # Scan range 1-254
    for i in range(1, 255):
        target = f"{network_prefix}.{i}"
        t = threading.Thread(target=scan_target, args=(target,))
        threads.append(t)
        t.start()
        # Throttle to prevent socket exhaustion
        time.sleep(0.01)
        
    for t in threads:
        t.join()
        
    print("[*] DUDE: Network Mapping Complete.")

if __name__ == "__main__":
    dude_map()
