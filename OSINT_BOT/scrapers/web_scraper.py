# scrapers/web_scraper.py
# This agent is a predator for the open web (HTTP/HTTPS).

import requests
from bs4 import BeautifulSoup

from ..utils.data_storage import save_intelligence
from ..utils import evasion

def scrape(urls: list[str], user_agent: str):
    """
    The main entry point for the web scraper.
    Iterates through a list of URLs, fetches their content, and parses it.
    """
    if not urls:
        print("No web URLs provided to scrape.")
        return

    headers = {'User-Agent': user_agent}
    
    for i, url in enumerate(urls):
        # Introduce a strategic delay before each request, except the very first one.
        if i > 0:
            evasion.strategic_delay()

        print(f"--- Accessing target: {url} ---")
        try:
            response = requests.get(url, headers=headers, timeout=15)
            # Raise an exception for bad status codes (4xx or 5xx)
            response.raise_for_status()

            print(f"Success. Status: {response.status_code}. Parsing and archiving...")
            
            # Use lxml for performance if available, otherwise html.parser
            soup = BeautifulSoup(response.content, 'lxml')

            # --- Intelligence Archiving ---
            # 1. Archive all headings (h1, h2, h3)
            headings = soup.find_all(['h1', 'h2', 'h3'])
            if headings:
                print(f"  [Archiving {len(headings)} headings...]")
                for h in headings:
                    save_intelligence(
                        source='Web',
                        target=url,
                        data_type='heading',
                        content=h.get_text(strip=True)
                    )

            # 2. Archive all hyperlinks
            links = soup.find_all('a', href=True)
            if links:
                print(f"  [Archiving {len(links)} links...]")
                for link in links:
                    href = link['href']
                    if href and (href.startswith('http') or href.startswith('/')):
                        save_intelligence(
                            source='Web',
                            target=url,
                            data_type='link',
                            content=href
                        )
            
            if not headings and not links:
                print("  No primary intelligence (headings, links) extracted.")

        except requests.exceptions.RequestException as e:
            print(f"A network error occurred while accessing {url}: {e}")
        except Exception as e:
            print(f"An unexpected error occurred for {url}: {e}")

