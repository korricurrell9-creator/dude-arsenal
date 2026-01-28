# utils/evasion.py
# This module provides tools for stealth and evasion.
# A hunter must not be seen by its prey.

import time
import random

def strategic_delay(min_seconds=2, max_seconds=5):
    """
    Pauses execution for a random interval to mimic human behavior
    and avoid rate-limiting.
    """
    delay = random.uniform(min_seconds, max_seconds)
    # print(f"  (Evasion: delaying for {delay:.2f} seconds...)") # Uncomment for debugging
    time.sleep(delay)

# Future Evasion Enhancements:
# - User-Agent Rotation: Cycle through a list of common user agents.
# - Proxy Rotation: Use a pool of proxies to distribute requests across multiple IP addresses.
# - Advanced Header Spoofing: Mimic headers sent by real browsers more accurately (e.g., Accept-Language, Referer).
