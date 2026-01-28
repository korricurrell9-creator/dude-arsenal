import asyncio
import websockets
import json

async def test_ws():
    uri = "wss://chat.hklq88.com/"
    print(f"[*] DUDE: Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("[+] Connected.")
            # Send a heartbeat/bind message as seen in the JS
            bind_msg = {"type": "bind", "msg": "心跳"}
            await websocket.send(json.dumps(bind_msg))
            print(f"[>] Sent: {bind_msg}")
            
            # Wait for some messages
            for _ in range(5):
                response = await websocket.recv()
                print(f"[<] Received: {response}")
    except Exception as e:
        print(f"[!] Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_ws())
