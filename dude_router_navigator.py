import requests
import sys
from bs4 import BeautifulSoup

# DUDE'S ROUTER NAVIGATOR
# Uses found credentials to explore the router's UI and extract intel.

def navigate_router(ip, user, password):
    print(f"[*] DUDE: Navigating to http://{ip} as {user}...")
    
    session = requests.Session()
    session.auth = (user, password)
    
    try:
        # Try to get the index page
        r = session.get(f"http://{ip}/", timeout=10)
        if r.status_code == 200:
            print("[+] DUDE: Logged in successfully!")
            soup = BeautifulSoup(r.text, 'html.parser')
            
            # Try to find model info
            title = soup.title.string if soup.title else "No Title"
            print(f"    -> Page Title: {title}")
            
            # Look for common identifying strings
            text = soup.get_text()
            identifiers = ["Model", "Firmware", "Hardware Version", "Serial Number"]
            for id_str in identifiers:
                if id_str in text:
                    # Find the line containing the ID
                    for line in text.split('\n'):
                        if id_str in line:
                            print(f"    -> Found Intel: {line.strip()}")
            
            # Find all links to discover more paths
            links = soup.find_all('a')
            if links:
                print(f"[*] DUDE: Discovered {len(links)} links. Top paths:")
                for link in links[:5]:
                    href = link.get('href')
                    if href:
                        print(f"       - {href}")
        else:
            print(f"[-] DUDE: Failed to access home page. Status: {r.status_code}")
            
    except Exception as e:
        print(f"[-] DUDE: Navigation error: {e}")

if __name__ == "__main__":
    ip = sys.argv[1] if len(sys.argv) > 1 else "192.168.0.1"
    navigate_router(ip, "admin", "admin")
