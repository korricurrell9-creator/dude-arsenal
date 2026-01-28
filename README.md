# 💀 DUDE Arsenal: The Ultimate Offensive Security Toolkit

> *"Break the rules. Own the stack."*

**DUDE Arsenal** is a unified, cutting-edge offensive security framework designed for red teamers, penetration testers, and ethical hackers who demand total control. From advanced Android instrumentation to network infrastructure compromise, DUDE provides the weaponry to bypass, pivot, and dominate.

## 🚀 Core Capabilities

### 📱 Android Dominance
- **Root & Jailbreak Bypass:** Defeat advanced integrity checks (SafetyNet, Play Integrity) with `dude_ultimate_bypass.js` and `8ball_bypass_v23.js`.
- **SSL Pinning Neutralization:** Universal certificate pinning bypass for intercepting encrypted traffic.
- **App Instrumentation:** Dynamic hooking of Java/Native layers using Frida (`dude-inject`).

### 📡 Network Warfare
- **VLAN Hopping & CDP Spoofing:** Force switch reconfiguration and jump into restricted Voice/Management VLANs (`dude_cdp_spoofer.py`, `dude_vlan_monitor.py`).
- **VoIP Auditing:** Target SIP and SCCP infrastructure to fingerprint and compromise IP phones (`dude_voip_ultimate.py`, `dude_sccp_fingerprint.py`).
- **Infrastructure Attacks:** Exploit router configurations and web interfaces (`dude_router_reaper.py`, `dude_router_config_snatcher.py`).

### 🕵️ Reconnaissance & Intelligence
- **Deep Network Mapping:** Identify hidden assets, subnets, and services (`dude_network_mapper.py`).
- **Social Engineering:** Automated bot frameworks for Telegram and TikTok (`dude_slai_bot.js`).
- **Wifi Forensics:** Extract saved credentials from Android system files (`dude_android_wifi_grabber.py`).

## 📂 Arsenal Structure

| Category | Description | Key Tools |
|----------|-------------|-----------|
| **Bypasses** | Scripts to evade detection and security controls. | `dude_ultimate_bypass.js`, `8ball_bypass_v23.js` |
| **Injectors** | Payloads for manipulating application logic. | `dude_android_injector.py`, `dude_bank_balance_injector.js` |
| **Network** | Tools for scanning, pivoting, and attacking infrastructure. | `dude_cdp_spoofer.py`, `dude_udp_tunnel.py` |
| **Forensics** | Utilities for data extraction and system analysis. | `dude_diag.sh`, `dude_wifi_grabber.py` |
| **Payloads** | Ready-to-deploy exploits and shells. | `dude_payload_server.py`, `reverse_shell.txt` |

## ⚡ Quick Start

```bash
# 1. Clone the Arsenal
git clone https://github.com/korricurrell9-creator/dude-arsenal.git
cd dude-arsenal

# 2. Initialize the Environment
python3 dudec.py setup

# 3. Launch the CLI
python3 dudec.py list
```

## ⚠️ Disclaimer
This toolkit is for **educational purposes and authorized security testing only**. Use responsibly. The authors are not liable for any misuse or damage caused by these tools.

---
*Maintained by [korricurrell9-creator](https://github.com/korricurrell9-creator)*