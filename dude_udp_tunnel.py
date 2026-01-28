import socket
import sys

# DUDE'S UDP SNNEAK
# Wraps data in a dummy DNS query to bypass basic firewalls.

def tunnel_udp(target_ip, target_port, payload):
    print(f"[*] DUDE: Tunneling payload to {target_ip}:{target_port} via DNS Spoof...")
    
    # Dummy DNS Header (Transaction ID, Flags, Questions...)
    dns_header = b'\x12\x34\x01\x00\x00\x01\x00\x00\x00\x00\x00\x00'
    # Our SIP payload wrapped as a 'query'
    dns_query = dns_header + payload.encode()
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.settimeout(5)
        # Sending to the target port, but looking like DNS
        sock.sendto(dns_query, (target_ip, target_port))
        
        data, addr = sock.recvfrom(4096)
        print(f"[+] DUDE: Received Response from {addr}!")
        print(data[12:].decode(errors='ignore')) # Strip DNS header
        
    except Exception as e:
        print(f"[-] DUDE Tunnel Error: {e}")

if __name__ == "__main__":
    sip_invite = "OPTIONS sip:100@172.16.16.223 SIP/2.0\r\n\r\n"
    tunnel_udp("172.16.16.223", 5060, sip_invite)
