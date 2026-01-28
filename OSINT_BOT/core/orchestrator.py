# core/orchestrator.py
# The central nervous system of the OSINT Bot.
# This module directs the various scraping agents.

from ..scrapers import telegram_scraper, web_scraper, tor_scraper, network_scanner
from ..utils import data_storage
from . import config

class Orchestrator:
    """
    The master controller for all scraping and intelligence operations.
    Initializes with mission parameters and dispatches agents.
    """
    def __init__(self):
        print("Orchestrator awakening...")
        try:
            # --- INITIALIZE MEMORY CORE ---
            data_storage.initialize_database()

            # Load mission parameters from the config interpreter
            self.telegram_targets = config.get_telegram_targets()
            self.tor_proxy = config.get_tor_proxy()
            self.user_agent = config.get_user_agent()
            print("Mission parameters locked and loaded.")
        except Exception as e:
            print(f"FATAL: Orchestrator failed to initialize. Mission aborted. Reason: {e}")
            # In a real scenario, this would trigger a more robust error handling/shutdown sequence.
            raise

    def run_telegram_mission(self):
        """
        Dispatches the Telegram scraping agent.
        """
        print("\n[MISSION START] TELEGRAM")
        if not self.telegram_targets:
            print("No Telegram targets specified in config.ini. Mission stands down.")
            return

        print(f"Targets acquired: {self.telegram_targets}")
        # --- ACTIVATING TELEGRAM AGENT ---
        telegram_scraper.scrape(self.telegram_targets)
        # --- AGENT RUN COMPLETE ---
        print("[MISSION END] TELEGRAM")

    def run_web_mission(self, urls: list[str]):
        """
        Dispatches the web scraping agent against a list of URLs.
        """
        print("\n[MISSION START] STANDARD WEB")
        if not urls:
            print("No web targets provided. Mission stands down.")
            return
            
        print(f"Targets acquired: {urls}")
        # --- ACTIVATING WEB AGENT ---
        web_scraper.scrape(urls, self.user_agent)
        # --- AGENT RUN COMPLETE ---
        print("[MISSION END] STANDARD WEB")

    def run_tor_mission(self, onion_urls: list[str]):
        """
        Dispatches the Tor scraping agent against a list of .onion URLs.
        """
        print("\n[MISSION START] TOR/DEEP WEB")
        if not onion_urls:
            print("No .onion targets provided. Mission stands down.")
            return

        print(f"Targets acquired: {onion_urls}")
        # --- ACTIVATING TOR AGENT ---
        tor_scraper.scrape(onion_urls, self.user_agent, self.tor_proxy)
        # --- AGENT RUN COMPLETE ---
        print("[MISSION END] TOR/DEEP WEB")

    def run_network_mission(self, target_ip: str):
        """
        Dispatches the network scanning agent against a target IP.
        """
        print("\n[MISSION START] NETWORK SCAN")
        if not target_ip:
            print("No target IP provided. Mission stands down.")
            return

        print(f"Target acquired: {target_ip}")
        # --- ACTIVATING NETWORK AGENT ---
        network_scanner.execute_scan(target_ip)
        # --- AGENT RUN COMPLETE ---
        print("[MISSION END] NETWORK SCAN")

def initialize():
    """Factory function to create and return an Orchestrator instance."""
    return Orchestrator()
    return Orchestrator()
