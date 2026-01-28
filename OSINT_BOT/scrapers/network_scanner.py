# scrapers/network_scanner.py
# DUDE's Network Analysis Tool
# Active reconnaissance module.

import socket
import requests
import concurrent.futures
from ..utils.data_storage import save_intelligence

COMMON_PORTS = {
    21: 'FTP',
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    53: 'DNS',
    80: 'HTTP',
    110: 'POP3',
    135: 'RPC',
    139: 'NetBIOS',
    143: 'IMAP',
    443: 'HTTPS',
    445: 'SMB',
    993: 'IMAP (SSL)',
    995: 'POP3 (SSL)',
    3306: 'MySQL',
    3389: 'RDP',
    5900: 'VNC',
    8080: 'HTTP-Alt'
}

def scan_port(target_ip, port):
    """Checks if a single port is open."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1.0)
            result = s.connect_ex((target_ip, port))
            if result == 0:
                service = COMMON_PORTS.get(port, 'Unknown')
                return port, service
    except:
        pass
    return None

def geoip_lookup(target_ip):
    """
    Retrieves geolocation data for the target IP.
    """
    print(f"--- Running GeoIP Lookup for {target_ip} ---")
    try:
        response = requests.get(f"http://ip-api.com/json/{target_ip}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data['status'] == 'fail':
                print(f"GeoIP failed: {data.get('message')}")
                return

            info = f"Location: {data.get('city')}, {data.get('country')} | ISP: {data.get('isp')} | Org: {data.get('org')}"
            print(f"Result: {info}")
            
            save_intelligence(
                source='Network',
                target=target_ip,
                data_type='geoip',
                content=info
            )
        else:
            print("GeoIP API request failed.")
    except Exception as e:
        print(f"GeoIP Error: {e}")

def run_port_scan(target_ip, port_range=None):
    """
    Scans the target IP for open ports.
    If port_range is None, scans common ports.
    """
    print(f"--- Starting Port Scan on {target_ip} ---")
    
    ports_to_scan = port_range if port_range else COMMON_PORTS.keys()
    
    open_ports = []
    
    # Use threading to speed up the scan
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(scan_port, target_ip, port): port for port in ports_to_scan}
        
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            if result:
                port, service = result
                print(f"[+] Port {port} is OPEN ({service})")
                open_ports.append(f"{port}/{service}")
                
                save_intelligence(
                    source='Network',
                    target=target_ip,
                    data_type='port_open',
                    content=f"Port {port} ({service}) is OPEN"
                )

    if not open_ports:
        print("No open ports found in the specified range.")
    else:
        print("Scan complete.")

def execute_scan(target_ip):
    """
    Main entry point for the network scanner.
    """
    geoip_lookup(target_ip)
    run_port_scan(target_ip)
