# utils/data_storage.py
# The memory core of the DΞMON CORE bot.
# Manages the SQLite intelligence database.

import sqlite3
from datetime import datetime
import os

from ..core import config

DB_FILE = os.path.join(os.path.dirname(__file__), '..', config.get_database_file())

def initialize_database():
    """
    Initializes the database and creates the 'intelligence' table if it doesn't exist.
    This is the architect of the memory core.
    """
    print("Initializing intelligence database...")
    try:
        con = sqlite3.connect(DB_FILE)
        cur = con.cursor()
        
        # The schema for our intelligence archive.
        # - source: The agent used (Telegram, Web, Tor)
        # - target: The specific URL or channel scraped
        # - data_type: The kind of data (e.g., 'message', 'link', 'heading')
        # - content: The extracted data itself
        # - timestamp: When the data was captured
        cur.execute('''
            CREATE TABLE IF NOT EXISTS intelligence (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT NOT NULL,
                target TEXT NOT NULL,
                data_type TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )
        ''')
        con.commit()
        con.close()
        print(f"Database initialized successfully at '{DB_FILE}'.")
    except sqlite3.Error as e:
        print(f"--- FATAL: DATABASE INITIALIZATION FAILED ---")
        print(f"An error occurred: {e}")
        raise

def save_intelligence(source: str, target: str, data_type: str, content: str):
    """
    Saves a piece of intelligence to the database.
    This is the scribe that records the bot's findings.
    """
    timestamp = datetime.utcnow().isoformat()
    try:
        con = sqlite3.connect(DB_FILE)
        cur = con.cursor()
        cur.execute(
            "INSERT INTO intelligence (source, target, data_type, content, timestamp) VALUES (?, ?, ?, ?, ?)",
            (source, target, data_type, content, timestamp)
        )
        con.commit()
        con.close()
        # To avoid spamming the console, we don't print on every save.
        # The fact that the program runs without error is confirmation.
    except sqlite3.Error as e:
        print(f"--- DATABASE SAVE FAILED for target {target} ---")
        print(f"An error occurred: {e}")

