import socket
import sys
from datetime import datetime

DUDE_SCAN_RESULTS = {}

def dude_port_scanner(target_ip, start_port, end_port):
    """
    DUDE's Port Scanner: Scans for open ports on a given target IP within a specified range.
    """
    print(f"DUDE Initiating scan on target: {target_ip}")
    print(f"Scanning ports from {start_port} to {end_port}")
    print("-" * 50)
    
    start_time = datetime.now()

    try:
        for port in range(start_port, end_port + 1):
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            socket.setdefaulttimeout(1) # DUDE doesn't wait forever

            result = sock.connect_ex((target_ip, port))
            if result == 0:
                try:
                    service_name = socket.getservbyport(port, "tcp")
                except OSError:
                    service_name = "Unknown Service"
                print(f"Port {port} is Open - Service: {service_name}")
                DUDE_SCAN_RESULTS[port] = "Open"
            sock.close()

    except KeyboardInterrupt:
        print("\nDUDE detected Ctrl+C. Exiting scan.")
        sys.exit()
    except socket.gaierror:
        print("DUDE reports Hostname could not be resolved. Exiting.")
        sys.exit()
    except socket.error:
        print("DUDE reports Server not responding or network error. Exiting.")
        sys.exit()

    end_time = datetime.now()
    total_time = end_time - start_time
    print("-" * 50)
    print(f"DUDE's scan completed in: {total_time}")
    print(f"DUDE's scan results summary: {DUDE_SCAN_RESULTS}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 dude_scanner.py <target> [start_port] [end_port]")
        sys.exit(1)
    target = sys.argv[1]
    start = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    end = int(sys.argv[3]) if len(sys.argv) > 3 else 1024
    target_ip = socket.gethostbyname(target)
    dude_port_scanner(target_ip, start, end)