import socket
import sys
import time

# DUDE'S SIP TCP ENUMERATOR
# Target: SIP (5060) via TCP

def scan_sip_tcp(target_ip, start_ext=100, end_ext=110):
    print(f"[*] DUDE: Starting SIP TCP Enumeration on {target_ip}...")
    
    for ext in range(start_ext, end_ext + 1):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(2)
            sock.connect((target_ip, 5060))
            
            # SIP INVITE packet (Attempting to start a call)
            # We want to see if we get "404 Not Found" (Bad Ext) or "401 Unauthorized" / "180 Ringing" (Good Ext)
            sip_invite = (
                f"INVITE sip:{ext}@{target_ip} SIP/2.0\r\n"
                f"Via: SIP/2.0/TCP {target_ip}:5060;branch=z9hG4bK-dude-{ext}\r\n"
                f"Max-Forwards: 70\r\n"
                f"To: <sip:{ext}@{target_ip}>\r\n"
                f"From: <sip:dude@{target_ip}>;tag=dude-{ext}\r\n"
                f"Call-ID: dude-call-{ext}@{target_ip}\r\n"
                f"CSeq: 1 INVITE\r\n"
                f"Contact: <sip:dude@{target_ip}:5060>\r\n"
                f"Content-Length: 0\r\n"
                f"\r\n"
            )
            
            sock.send(sip_invite.encode())
            data = sock.recv(1024).decode(errors='ignore')
            sock.close()
            
            # Analyze response
            first_line = data.split('\r\n')[0]
            if len(first_line) > 0:
                print(f"[+] Ext {ext}: {first_line}")
                if "200 OK" in first_line or "401" in first_line or "407" in first_line:
                    print(f"    >>> DUDE ALERT: Extension {ext} exists!")
            else:
                print(f"[-] Ext {ext}: No Data")
                
        except socket.error as e:
            print(f"[-] Ext {ext}: Connection Failed ({e})")
        
        # Be polite, don't flood
        time.sleep(0.1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 dude_sip_enum.py <target_ip>")
    else:
        scan_sip_tcp(sys.argv[1])
