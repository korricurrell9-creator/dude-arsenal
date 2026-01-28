# scrapers/tor_scraper.py
# This agent is engineered to navigate the Tor network (Deep/Dark Web).
# WARNING: Use this tool responsibly and legally. You are accountable for your actions.

import requests
from bs4 import BeautifulSoup

from ..utils.data_storage import save_intelligence
from ..utils import evasion

def scrape(urls: list[str], user_agent: str, tor_proxy: str):
    """
    Main entry point for the Tor scraper.
    Routes requests through the specified SOCKS proxy to access .onion sites.
    """
    if not urls:
        print("No .onion URLs provided to scrape.")
        return

    print("--- [Tor Agent] Verifying proxy access ---")
    print("This agent requires a running Tor service (e.g., Tor Browser) to provide the SOCKS proxy.")
    
    headers = {'User-Agent': user_agent}
    
    # Configure the session to use the Tor SOCKS proxy
    proxies = {
        'http': tor_proxy,
        'https': tor_proxy
    }

    try:
        # Test the proxy connection
        print(f"Testing proxy {tor_proxy}...")
        ip_check_url = "http://httpbin.org/ip"
        response = requests.get(ip_check_url, proxies=proxies, timeout=30)
        tor_ip = response.json().get('origin')
        print(f"Proxy test successful. Your apparent IP through Tor is: {tor_ip}")
    except requests.exceptions.RequestException as e:
        print(f"--- FATAL: PROXY TEST FAILED ---")
        print(f"Could not connect to the Tor proxy at '{tor_proxy}'.")
        print("Ensure Tor is running and the proxy address in config.ini is correct.")
        print(f"Error details: {e}")
        return

    # If the proxy test was successful, proceed to scrape the target URLs.
    for i, url in enumerate(urls):
        # Introduce a strategic delay before each request.
        if i > 0:
            evasion.strategic_delay()

        print(f"--- Accessing Tor target: {url} ---")
        try:
            response = requests.get(url, headers=headers, proxies=proxies, timeout=60) # Longer timeout for Tor
            response.raise_for_status()

            print(f"Success. Status: {response.status_code}. Parsing and archiving...")
            soup = BeautifulSoup(response.content, 'lxml')

            # --- Intelligence Archiving ---
            headings = soup.find_all(['h1', 'h2', 'h3'])
            if headings:
                print(f"  [Archiving {len(headings)} headings...]")
                for h in headings:
                    save_intelligence(
                        source='Tor',
                        target=url,
                        data_type='heading',
                        content=h.get_text(strip=True)
                    )

            links = soup.find_all('a', href=True)
            if links:
                print(f"  [Archiving {len(links)} links...]")
                for link in links:
                    href = link['href']
                    if href:
                         save_intelligence(
                            source='Tor',
                            target=url,
                            data_type='link',
                            content=href
                        )
            
            if not headings and not links:
                print("  No primary intelligence (headings, links) extracted.")

        except requests.exceptions.RequestException as e:
            print(f"Could not access {url} through Tor: {e}")
        except Exception as e:
            print(f"An unexpected error occurred for {url}: {e}")
