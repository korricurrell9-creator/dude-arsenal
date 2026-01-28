#!/usr/bin/env python3
import os
import sys
import subprocess
import time

# DUDE CONTROL CLI - BEAST MODE
# A unified interface for the DUDE forensic and instrumentation toolkit.

VERSION = "2.5.0-BEAST"

def banner():
    print(r"""
    ______  __  __  _____   ______ 
    |  _  \|  ||  ||  _  \ |  ____|
    | | | ||  ||  || | | || |____  
    | | | ||  ||  || | | ||  ____| 
    | |_| ||  ||  || |_| || |____  
    |_____/ \____/ |_____/ |______| 
       DUDE CONTROL - BEAST MODE v""" + VERSION)
    print("    \"Break the rules. Own the stack.\"\n")

def list_modules():
    print("[*] DUDE: Scanning for available weapons...")
    
    scripts = [f for f in os.listdir(".") if f.endswith((".js", ".py", ".sh"))]
    
    categories = {
        "🚀 Bypasses": [f for f in scripts if "bypass" in f],
        "💉 Injectors": [f for f in scripts if "injector" in f or f == "dude-inject"],
        "🎵 TikTok": [f for f in scripts if f.startswith("tiktok_")],
        "📱 Telegram": [f for f in scripts if f.startswith("telegram_")],
        "📡 Network": [f for f in scripts if "net" in f or "scan" in f or "sniff" in f],
        "💀 Payloads": [f for f in scripts if "payload" in f or f.endswith(".ps1")],
        "🛡️ Forensic": [f for f in scripts if "diag" in f or "verify" in f]
    }
    
    for cat, files in categories.items():
        if files:
            print(f"\n{cat}:")
            for f in sorted(files):
                print(f"  - {f}")

def setup():
    print("[*] DUDE: Initiating Zero-Day Build Sequence...")
    
    # 1. Run the legacy setup script
    print("[*] DUDE: Running legacy setup...")
    subprocess.run(["bash", "dude_setup.sh"])
    
    # 2. Install Node dependencies
    if os.path.exists("package.json"):
        print("[*] DUDE: Siphoning Node modules...")
        subprocess.run(["npm", "install", "--quiet"], capture_output=True)
    
    # 3. Check for objection-env
    if os.path.exists("objection-env"):
        print("[+] DUDE: Objection environment detected.")
    else:
        print("[!] DUDE: Objection-env missing. You might need to create it.")

    print("\n[+] DUDE: System is now ARMED and DANGEROUS.")

def run_inject(pkg=None):
    if not pkg:
        print("[!] DUDE: You forgot the target package! Use: dudec inject <com.pkg.name>")
        return
    
    print(f"[*] DUDE: Unleashing hell on {pkg}...")
    subprocess.run(["bash", "dude-inject", pkg])

def main():
    if len(sys.argv) < 2:
        banner()
        print("Usage: dudec <command> [args]")
        print("\nCommands:")
        print("  setup             - Prepare the environment and install dependencies")
        print("  list              - Show all available modules")
        print("  inject <pkg>      - Trigger the universal Android bypass")
        print("  serve             - Start the payload delivery server")
        print("  tiktok <module>   - Run a specific TikTok module")
        print("  version           - Show version info")
        sys.exit(0)

    cmd = sys.argv[1].lower()

    if cmd == "setup":
        setup()
    elif cmd == "list":
        list_modules()
    elif cmd == "inject":
        pkg = sys.argv[2] if len(sys.argv) > 2 else None
        run_inject(pkg)
    elif cmd == "serve":
        print("[*] DUDE: Starting Payload Server...")
        subprocess.run(["python3", "dude_payload_server.py"])
    elif cmd == "tiktok":
        if len(sys.argv) < 3:
            print("[!] DUDE: Specify a module. Use 'dudec list' to see them.")
            return
        module = sys.argv[2]
        if not module.endswith(".js"):
            module += ".js"
        print(f"[*] DUDE: Launching TikTok {module}...")
        # Assuming standard frida launch
        subprocess.run(["frida", "-U", "-f", "com.ss.android.ugc.trill", "-l", module])
    elif cmd == "version":
        banner()
    else:
        print(f"[!] DUDE: Unknown command '{cmd}'")

if __name__ == "__main__":
    main()
