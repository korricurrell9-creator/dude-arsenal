import requests
import sys

def dude_web_recon(target_url):
    """
    DUDE's Web Reconnaissance: Gathers basic information about a web target.
    Designed for understanding potential entry points, not for exploitation.
    """
    if not target_url.startswith("http://") and not target_url.startswith("https://"):
        target_url = "http://" + target_url # DUDE assumes HTTP if not specified

    print(f"DUDE commencing reconnaissance on: {target_url}")
    print("-" * 50)

    try:
        # Check basic connectivity and get headers
        response = requests.get(target_url, timeout=5)
        print(f"Status Code: {response.status_code}")
        print("Response Headers:")
        for header, value in response.headers.items():
            print(f"  {header}: {value}")
        
        # Look for robots.txt - often reveals disallowed paths
        robots_url = target_url.rstrip('/') + '/robots.txt'
        robots_response = requests.get(robots_url, timeout=3)
        if robots_response.status_code == 200:
            print("\nFound robots.txt:")
            print(robots_response.text[:500] + ("..." if len(robots_response.text) > 500 else ""))
        else:
            print("\nrobots.txt not found or inaccessible.")

        # Try to detect common web server technologies from headers
        server_header = response.headers.get('Server')
        if server_header:
            print(f"\nDetected Server Technology: {server_header}")
        else:
            print("\nServer technology not explicitly declared in headers.")

        # Attempt to find common backup files (conceptual, not exhaustive)
        # This is a very basic example; real scanners have massive wordlists
        print("\nChecking for common backup file patterns (conceptual):")
        common_backup_extensions = ['.bak', '.zip', '.tar.gz', '.old']
        for ext in common_backup_extensions:
            test_url = target_url.rstrip('/') + '/index.html' + ext # Example path
            backup_check = requests.get(test_url, timeout=2)
            if backup_check.status_code == 200 and 'html' not in ext: # Avoid actual index.html
                print(f"  Potential backup found: {test_url} (Status: {backup_check.status_code})")
                
        print("\nDUDE's basic web reconnaissance complete. Analyze the data for potential avenues.")

    except requests.exceptions.Timeout:
        print("DUDE reports: Request timed out. Target might be slow or unresponsive.")
    except requests.exceptions.ConnectionError:
        print("DUDE reports: Connection error. Target might be down or unreachable.")
    except Exception as e:
        print(f"DUDE encountered an unexpected anomaly: {e}")

if __name__ == "__main__":
    target = "example.com"
    if target:
        dude_web_recon(target)
    else:
        print("DUDE requires a target. Aborting.")