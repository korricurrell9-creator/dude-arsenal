# core/config.py
# This module reads the will of the user from config.ini

import configparser
import os

# Build the path to the configuration file
# This assumes config.ini is in the parent directory of the 'core' module
_CONFIG_PATH = os.path.join(os.path.dirname(__file__), '..', 'config.ini')

if not os.path.exists(_CONFIG_PATH):
    raise FileNotFoundError(f"FATAL: Configuration file not found at {_CONFIG_PATH}. The bot is blind.")

config = configparser.ConfigParser()
config.read(_CONFIG_PATH)

# --- Accessor functions for hyper-specific configuration data ---
# This provides a clean, centralized interface for the rest of the application

def get_telegram_credentials():
    """Retrieves Telegram API credentials."""
    api_id = config.get('Telegram', 'api_id', fallback=None)
    api_hash = config.get('Telegram', 'api_hash', fallback=None)
    if not api_id or not api_hash or api_id == 'YOUR_API_ID':
        raise ValueError("CRITICAL: Telegram api_id and api_hash must be set in config.ini")
    return api_id, api_hash

def get_telegram_targets():
    """Retrieves target Telegram channels/groups."""
    targets_raw = config.get('Telegram', 'targets', fallback='')
    return [target.strip() for target in targets_raw.split(',') if target.strip()]

def get_tor_proxy():
    """Retrieves the Tor SOCKS proxy address."""
    return config.get('Tor', 'proxy', fallback='socks5h://127.0.0.1:9150')

def get_user_agent():
    """Retrieves the default User-Agent for scraping."""
    return config.get('Scraping', 'user_agent', fallback='Mozilla/5.0')
    
def get_database_file():
    """Retrieves the database file path."""
    return config.get('Database', 'db_file', fallback='intelligence.db')

# --- Self-test on module load ---
# A simple check to ensure the configuration is minimally viable.
try:
    get_user_agent()
    get_tor_proxy()
    get_database_file()
    print("Configuration module initialized. Parameters loaded.")
except Exception as e:
    print(f"ERROR during configuration self-test: {e}")

