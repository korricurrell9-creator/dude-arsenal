import socket
import hashlib
import time
import sys

# DUDE'S SIP REGISTER TOOL
# Attempts to register an extension with a name/password.

def get_nonce(response):
    for line in response.split('\n'):
        if 'WWW-Authenticate' in line:
            parts = line.split(',')
            for p in parts:
                if 'nonce=' in p:
                    return p.split('=')[1].strip('"')
    return None

def build_auth_response(username, password, realm, method, uri, nonce):
    # Digest Authentication
    ha1 = hashlib.md5(f"{username}:{realm}:{password}".encode()).hexdigest()
    ha2 = hashlib.md5(f"{method}:{uri}".encode()).hexdigest()
    response = hashlib.md5(f"{ha1}:{nonce}:{ha2}".encode()).hexdigest()
    return response

def sip_register(target_ip, username, password, display_name="DUDE"):
    port = 5060
    print(f"[*] DUDE: Attempting SIP Register for {username} ({display_name}) on {target_ip}...")
    
    # 1. Send initial Register to get nonce
    call_id = f"dude-{int(time.time())}"
    from_tag = "tag-dude"
    
    reg_msg = (
        f"REGISTER sip:{target_ip} SIP/2.0\r\n"
        f"Via: SIP/2.0/TCP {target_ip}:5060;branch=z9hG4bK-init\r\n"
        f"Max-Forwards: 70\r\n"
        f"To: <sip:{username}@{target_ip}>\r\n"
        f"From: \"{display_name}\" <sip:{username}@{target_ip}>;{from_tag}\r\n"
        f"Call-ID: {call_id}\r\n"
        f"CSeq: 1 REGISTER\r\n"
        f"Contact: <sip:{username}@127.0.0.1:5060;transport=tcp>\r\n"
        f"Expires: 3600\r\n"
        f"Content-Length: 0\r\n"
        f"\r\n"
    )

    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3)
        sock.connect((target_ip, port))
        sock.send(reg_msg.encode())
        
        data = sock.recv(4096)
        response = data.decode(errors='ignore')
        print(f"[+] DUDE: Received Initial Response:\n{response.splitlines()[0]}")
        
        if "401 Unauthorized" in response or "407 Proxy Authentication Required" in response:
            sock.close() # Reconnect for the challenge
            
            nonce = get_nonce(response)
            realm = "asterisk" # Common default, but we should parse it
            # Simple realm parsing
            for line in response.split('\n'):
                if 'realm=' in line:
                    realm = line.split('realm=')[1].split(',')[0].strip('"')
            
            if nonce:
                print(f"[*] DUDE: Nonce found: {nonce}. Calculating response...")
                auth_res = build_auth_response(username, password, realm, "REGISTER", f"sip:{target_ip}", nonce)
                
                auth_header = (
                    f"Authorization: Digest username=\"{username}\", realm=\"{realm}\", "
                    f"nonce=\"{nonce}\", uri=\"sip:{target_ip}\", response=\"{auth_res}\", algorithm=MD5\r\n"
                )
                
                # 2. Send Register with Auth
                reg_auth_msg = (
                    f"REGISTER sip:{target_ip} SIP/2.0\r\n"
                    f"Via: SIP/2.0/TCP {target_ip}:5060;branch=z9hG4bK-auth\r\n"
                    f"Max-Forwards: 70\r\n"
                    f"To: <sip:{username}@{target_ip}>\r\n"
                    f"From: \"{display_name}\" <sip:{username}@{target_ip}>;{from_tag}\r\n"
                    f"Call-ID: {call_id}\r\n"
                    f"CSeq: 2 REGISTER\r\n"
                    f"Contact: <sip:{username}@127.0.0.1:5060;transport=tcp>\r\n"
                    f"{auth_header}"
                    f"Expires: 3600\r\n"
                    f"Content-Length: 0\r\n"
                    f"\r\n"
                )
                
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(3)
                sock.connect((target_ip, port))
                sock.send(reg_auth_msg.encode())
                data = sock.recv(4096)
                final_response = data.decode(errors='ignore')
                print(f"[+] DUDE: Final Response:\n{final_response.splitlines()[0]}")
                if "200 OK" in final_response:
                    print(f"[!!!] DUDE SUCCESS: Registered as {username}!")
                else:
                    print("[-] DUDE: Registration failed.")
            else:
                print("[-] DUDE: Could not find nonce in response.")
        elif "200 OK" in response:
            print("[!!!] DUDE SUCCESS: Registered (No Auth Required)!")
        else:
            print(f"[-] DUDE: Unexpected response: {response.splitlines()[0]}")
            
    except Exception as e:
        print(f"[-] DUDE Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3 dude_sip_register.py <ip> <user> <pass> [name]")
    else:
        name = sys.argv[4] if len(sys.argv) > 4 else "Glen Blanchard"
        sip_register(sys.argv[1], sys.argv[2], sys.argv[3], name)
