import requests
import sys

def dude_deep_recon(target):
    print(f"[*] DUDE Deep Recon on {target}...")
    paths = ["/", "/webpages/index.html", "/login", "/portal", "/guest", "/cgi-bin/config.exp", "/js/login.js", "/css/style.css"]
    
    for path in paths:
        url = f"http://{target}{path}"
        try:
            r = requests.get(url, timeout=2)
            print(f"[{r.status_code}] {url} (Len: {len(r.text)})")
            if r.status_code == 200 and len(r.text) > 0:
                print(f"    -> Snippet: {r.text[:50]}...")
        except:
            pass

if __name__ == "__main__":
    dude_deep_recon(sys.argv[1] if len(sys.argv) > 1 else "192.168.0.1")
