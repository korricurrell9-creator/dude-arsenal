import requests
import sys
import re

# DUDE'S CAPTIVE PORTAL BYPASS
# Automatically logs into the NSWHealth Guest Portal.

def bypass_portal(user, password):
    print("[*] DUDE: Detecting Captive Portal...")
    
    # 1. Try to hit a test site to trigger the redirect
    test_url = "http://neverssl.com"
    try:
        r = requests.get(test_url, allow_redirects=True, timeout=5)
        
        if "neverssl.com" in r.url:
            print("[+] DUDE: No portal detected. You already have internet/network access!")
            return
        
        portal_url = r.url
        print(f"[!] DUDE: Portal Redirected to: {portal_url}")
        
        # 2. Analyze the portal page for the login form
        # We look for 'username', 'password', 'user', 'pwd' fields
        print("[*] DUDE: Extracting form fields...")
        
        form_data = {}
        # Common NSWHealth / Cisco ISE / Aruba portal fields
        # Since we have specific creds, we try to map them
        
        # This is a heuristic guess - in a real scenario, we'd parse the HTML
        # For NSWHealth, it often uses 'username' and 'password' or 'user_id'
        
        payload = {
            "username": user,
            "password": password,
            "submit": "Login",
            "terms": "yes"
        }
        
        # 3. Submit the credentials
        print(f"[*] DUDE: Submitting creds for {user}...")
        res = requests.post(portal_url, data=payload, timeout=10)
        
        if res.status_code == 200 and ("success" in res.text.lower() or "welcome" in res.text.lower()):
            print("[!!!] DUDE SUCCESS: Portal bypassed. You are now AUTHENTICATED.")
        else:
            print("[-] DUDE: Login failed. Check the credentials or the form fields.")
            print(f"    -> Response Code: {res.status_code}")
            # print(f"    -> Hint: {res.text[:200]}")

    except Exception as e:
        print(f"[-] DUDE Portal Error: {e}")

if __name__ == "__main__":
    user = "Glen Blanchard"
    pwd = "60217500"
    bypass_portal(user, pwd)
