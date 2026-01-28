import socket
import sys

# DUDE'S VOIP AUDIT TOOL
# Target: SIP (5060) and SCCP (2000)

def scan_sip(target_ip, port=5060):
    print(f"[*] DUDE: Sending SIP OPTIONS to {target_ip}:{port}...")
    
    # Construct a raw SIP OPTIONS packet
    # SIP requires a correct structure. 
    sip_payload = (
        f"OPTIONS sip:100@{target_ip} SIP/2.0\r\n"
        f"Via: SIP/2.0/UDP {target_ip}:{port};branch=z9hG4bK-dude-1\r\n"
        f"Max-Forwards: 70\r\n"
        f"To: <sip:100@{target_ip}>\r\n"
        f"From: <sip:dude@{target_ip}>;tag=dude-1\r\n"
        f"Call-ID: dude-call-id-1@{target_ip}\r\n"
        f"CSeq: 1 OPTIONS\r\n"
        f"Contact: <sip:dude@{target_ip}:5060>\r\n"
        f"Accept: application/sdp\r\n"
        f"Content-Length: 0\r\n"
        f"\r\n"
    )
    
    try:
        # SIP is usually UDP
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.settimeout(3)
        sock.sendto(sip_payload.encode(), (target_ip, port))
        
        data, addr = sock.recvfrom(4096)
        print(f"[+] DUDE: SIP Response Received from {addr}!")
        print("-" * 40)
        print(data.decode(errors='ignore'))
        print("-" * 40)
        
        # Extract Server/User-Agent header if present
        for line in data.decode(errors='ignore').split('\r\n'):
            if "Server" in line or "User-Agent" in line:
                print(f"[!] DUDE INTEL: {line}")
                
    except socket.timeout:
        print("[-] DUDE: No SIP response (UDP timeout). Target might be silent.")
    except Exception as e:
        print(f"[-] DUDE: SIP Error: {e}")

def check_sccp(target_ip, port=2000):
    print(f"\n[*] DUDE: Probing SCCP (Skinny) at {target_ip}:{port}...")
    try:
        # SCCP is TCP
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3)
        sock.connect((target_ip, port))
        print(f"[+] DUDE: Connection established to SCCP port!")
        
        # Send a dummy "StationRegister" message header just to provoke a reaction
        # 4 bytes length (little endian), 4 bytes reserved, 4 bytes message type
        # Msg Type 1 = RegisterMessage
        payload = b'\x04\x00\x00\x00\x00\x00\x00\x00\x01\x00\x00\x00' 
        
        sock.send(payload)
        response = sock.recv(1024)
        
        if response:
            print(f"[+] DUDE: SCCP Data Received: {response.hex()}")
        else:
            print("[-] DUDE: Connected, but no data received.")
            
        sock.close()
    except Exception as e:
        print(f"[-] DUDE: SCCP Connection Failed: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 dude_voip_audit.py <target_ip>")
    else:
        target = sys.argv[1]
        scan_sip(target)
        check_sccp(target)
