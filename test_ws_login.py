import asyncio
import websockets
import json

async def test_login_ws():
    uri = "wss://chat.hklq88.com/"
    print(f"[*] DUDE: Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("[+] Connected.")
            # Trying to send a login-like message
            login_msg = {"type": "login", "username": "AO889", "password": "ATK555"}
            await websocket.send(json.dumps(login_msg))
            print(f"[>] Sent: {login_msg}")
            
            # Wait for responses
            while True:
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    print(f"[<] Received: {response}")
                except asyncio.TimeoutError:
                    print("[!] Timeout waiting for more messages.")
                    break
    except Exception as e:
        print(f"[!] Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_login_ws())
