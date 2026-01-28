import socket
import sys
import struct
import time

# DUDE'S SCCP FINGERPRINTER
# Target: Port 2000 (Skinny Client Control Protocol)

def build_sccp_register(uid):
    # Header: Length (4), Reserved (4), MsgType (4)
    # MsgType 0x00000001 = StationRegisterMessage
    
    # Body: 
    # DeviceName (16 bytes)
    # StationUserId (4 bytes)
    # StationInstance (4 bytes)
    # IP (4 bytes)
    # DeviceType (4 bytes)
    # MaxStreams (4 bytes)
    
    msg_type = 0x00000001
    
    device_name = b"SEP000000000000" # Fake MAC
    station_user_id = 0
    station_instance = 1
    ip_addr = 0 # 0.0.0.0
    device_type = 7 # Cisco 7960 (Common)
    max_streams = 0
    
    # Re-doing pack with correct integers
    payload = (
        device_name.ljust(16, b'\x00') +
        struct.pack("<I", station_user_id) +
        struct.pack("<I", station_instance) +
        struct.pack("<I", ip_addr) +
        struct.pack("<I", device_type) +
        struct.pack("<I", max_streams)
    )
    
    length = 4 + len(payload)
    header = struct.pack("<III", length, 0, msg_type)
    
    return header + payload

def fingerprint(target_ip):
    print(f"[*] DUDE: Probing SCCP on {target_ip}...")
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        sock.connect((target_ip, 2000))
        print("[+] DUDE: Connected. Sending Register Message...")
        
        # Send a valid-looking Register message
        msg = build_sccp_register("dude")
        sock.send(msg)
        
        # Wait for "RegisterAck" (MsgType 0x81) or "RegisterReject" (MsgType 0x82)
        resp = sock.recv(2048)
        
        if len(resp) >= 12:
            try:
                r_len, r_res, r_type = struct.unpack("<III", resp[:12])
                print(f"[!] DUDE: Received Response! Type: {hex(r_type)} (Len: {r_len})")
                
                if r_type == 0x00000081: # RegisterAck
                    print("[+] DUDE: Target accepted us as a Phone! (RegisterAck)")
                    if len(resp) >= 24:
                        keep_alive = struct.unpack("<I", resp[12:16])[0]
                        print(f"    -> KeepAlive Interval: {keep_alive}")
                        print("[+] DUDE: This device is ACTIVE and talking.")
                elif r_type == 0x00000082: # RegisterReject
                    print("[-] DUDE: Target Rejected our registration (Expected).")
                    if len(resp) > 12:
                        reason = resp[12:].decode(errors='ignore').strip()
                        print(f"    -> Reason: {reason}")
                else:
                    print(f"[?] DUDE: Unknown Message Type: {hex(r_type)}")
                    print(f"    -> Raw Hex: {resp.hex()}")
            except struct.error as e:
                print(f"[-] DUDE: Unpack Error: {e}")
                print(f"    -> Raw Data: {resp.hex()}")
        elif len(resp) > 0:
            print(f"[-] DUDE: Received short response ({len(resp)} bytes): {resp.hex()}")
        else:
            print("[-] DUDE: Empty response.")
            
        sock.close()
        
    except socket.timeout:
        print("[-] DUDE: Timed Out. Target ignored the handshake.")
    except Exception as e:
        print(f"[-] DUDE: Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 dude_sccp_fingerprint.py <ip>")
    else:
        fingerprint(sys.argv[1])
