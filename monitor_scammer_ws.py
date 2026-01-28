import asyncio
import websockets
import json

async def monitor_ws():
    uri = "wss://chat.hklq88.com/"
    print(f"[*] DUDE: Impersonating SCAMMER (UID 7479202262939829264)...")
    try:
        async with websockets.connect(uri) as websocket:
            print("[+] Connected.")
            # Bind to Scammer UID
            bind_msg = {"type": "bind", "uid": "7479202262939829264"}
            await websocket.send(json.dumps(bind_msg))
            
            print("[*] Monitoring for incoming messages...")
            while True:
                response = await websocket.recv()
                print(f"[RECV] {response}")
    except Exception as e:
        print(f"[!] Error: {e}")

if __name__ == "__main__":
    asyncio.run(monitor_ws())
