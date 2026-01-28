import socket
import sys
import time

# DUDE'S ULTIMATE VOIP AUDITOR
# Targets SIP (UDP) and SCCP with specific payloads and headers.

def send_sip_options(target_ip, port=5060):
    print(f"[*] DUDE: Sending SIP OPTIONS (UDP) to {target_ip}:{port}...")
    
    # Using a Cisco-like User-Agent to bypass some filters
    user_agent = "Cisco-CP7960G/8.0"
    
    sip_payload = (
        f"OPTIONS sip:100@{target_ip} SIP/2.0\r\n"
        f"Via: SIP/2.0/UDP 192.168.0.34:{port};branch=z9hG4bK-dude-2\r\n"
        f"Max-Forwards: 70\r\n"
        f"To: <sip:100@{target_ip}>\r\n"
        f"From: <sip:dude@{target_ip}>;tag=dude-2\r\n"
        f"Call-ID: dude-call-id-2@{target_ip}\r\n"
        f"CSeq: 1 OPTIONS\r\n"
        f"User-Agent: {user_agent}\r\n"
        f"Contact: <sip:dude@192.168.0.34:5060>\r\n"
        f"Accept: application/sdp\r\n"
        f"Content-Length: 0\r\n"
        f"\r\n"
    )
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.settimeout(3)
        sock.sendto(sip_payload.encode(), (target_ip, port))
        
        data, addr = sock.recvfrom(4096)
        print(f"[+] DUDE: SIP Response Received from {addr}!")
        print("-" * 40)
        print(data.decode(errors='ignore'))
        print("-" * 40)
    except socket.timeout:
        print("[-] DUDE: SIP UDP Timeout.")
    except Exception as e:
        print(f"[-] DUDE: SIP Error: {e}")

def check_sccp_handshake(target_ip, port=2000):
    print(f"\n[*] DUDE: Attempting SCCP Handshake with Cisco MAC...")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3)
        sock.connect((target_ip, port))
        
        # Cisco Register Message for SEP001122334455
        # Header: Len(52), Reserved(0), MsgType(1)
        # Body: Name(SEP001122334455), UID(0), Instance(1), IP(0), Type(7), Streams(0)
        import struct
        payload = b"SEP001122334455".ljust(16, b'\x00') + struct.pack("<IIIII", 0, 1, 0, 7, 0)
        header = struct.pack("<III", len(payload) + 4, 0, 1)
        
        sock.send(header + payload)
        response = sock.recv(1024)
        if response:
            print(f"[+] DUDE: SCCP Response (Hex): {response.hex()}")
            if len(response) >= 12:
                r_len, r_res, r_type = struct.unpack("<III", response[:12])
                print(f"    -> Response Type: {hex(r_type)}")
        else:
            print("[-] DUDE: No SCCP response.")
        sock.close()
    except Exception as e:
        print(f"[-] DUDE: SCCP Error: {e}")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "172.16.16.223"
    send_sip_options(target)
    check_sccp_handshake(target)
