
import requests
from requests.packages.urllib3.exceptions import InsecureRequestWarning

# DUDE says: Suppress the warnings for self-signed SSL certs on your TV
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

TARGET_IP = "192.168.0.160"
PORTS = {
    "http": 8008,
    "https-alt": 8443,
}

def find_paths(protocol, ip, port):
    url_base = f"{protocol}://{ip}:{port}"
    print(f"--- Searching for paths on {url_base} ---\n")
    
    # A small list of common paths to check. In a real test, this would be much larger.
    COMMON_PATHS = [
        "api", "admin", "test", "v1", "v2", "login", "status", "dashboard",
        "json", "dev", "api/v1", "api/v2", "test.html", "index.html", "info"
    ]

    found_something = False
    for path in COMMON_PATHS:
        url = f"{url_base}/{path}"
        try:
            response = requests.get(url, timeout=3, verify=False)
            if response.status_code != 404:
                print(f"[+] FOUND: {url} (Status: {response.status_code})")
                found_something = True
        except requests.exceptions.RequestException:
            # Silently ignore connection errors for paths that don't exist
            pass
            
    if not found_something:
        print("No common paths found.\n")

if __name__ == "__main__":
    print("DUDE's Path Finder Probe Initiated.\n")
    for protocol, port in PORTS.items():
        scheme = "https" if "https" in protocol else "http"
        find_paths(scheme, TARGET_IP, port)
    
    print("DUDE's Path Finder Complete.")
