# scrapers/telegram_scraper.py
# This agent specializes in Telegram channel reconnaissance.

from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.errors import SessionPasswordNeededError, FloodWaitError
import asyncio

from ..core import config
from ..utils.data_storage import save_intelligence

# Telethon requires an event loop. This ensures it works correctly when called from a synchronous function.
try:
    loop = asyncio.get_running_loop()
except RuntimeError:
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

async def _scrape_messages(client, target_channel):
    """The core async function to scrape a single channel."""
    print(f"--- Accessing target: {target_channel} ---")
    try:
        # Use the client to get the entity (channel/group)
        entity = await client.get_entity(target_channel)
        
        # Fetch the last 15 messages. This is a configurable limit.
        messages = await client.get_messages(entity, limit=15)
        
        if not messages:
            print("No messages found. Channel might be empty or restricted.")
            return

        print(f"Found {len(messages)} recent messages. Archiving to database...")
        for message in messages:
            # Archive the intelligence to the database
            if message.text: # Only save messages that have text content
                date = message.date.strftime('%Y-%m-%d %H:%M:%S')
                content = f"[{date}] {message.text}"
                save_intelligence(
                    source='Telegram',
                    target=target_channel,
                    data_type='message',
                    content=content
                )
        print("Archiving complete for this target.")

    except FloodWaitError as e:
        print(f"Flood wait error: sleeping for {e.seconds} seconds. The API is throttling us.")
        await asyncio.sleep(e.seconds)
    except ValueError:
        print(f"Could not find the channel: {target_channel}. It may be private or spelled incorrectly.")
    except Exception as e:
        print(f"An unexpected error occurred while scraping {target_channel}: {e}")

async def _run_telegram_session(api_id, api_hash, targets):
    """Manages the Telegram client session."""
    # Using an in-memory session. For persistence, a file-based session could be used.
    async with TelegramClient(StringSession(), api_id, api_hash) as client:
        print("Telegram client initialized. Attempting to connect...")
        
        # Ensure the client is connected
        is_connected = await client.is_user_authorized()
        if not is_connected:
            print("WARNING: Client is not authorized. This could mean your API keys are invalid, or 2FA is needed.")
            print("The bot cannot proceed with Telegram scraping without valid authentication.")
            return

        print("Connection successful. Proceeding to scrape targets.")
        for target in targets:
            await _scrape_messages(client, target)

def scrape(targets: list[str]):
    """
    The main entry point for the Telegram scraper.
    It retrieves credentials and launches the asynchronous scraping session.
    """
    try:
        api_id, api_hash = config.get_telegram_credentials()
    except (ValueError, configparser.NoSectionError) as e:
        print(f"Cannot start Telegram mission: {e}")
        return

    if not targets:
        print("No Telegram targets provided to scrape.")
        return

    print("Launching async Telegram scraper...")
    # This runs the main async logic and waits for it to complete.
    loop.run_until_complete(_run_telegram_session(api_id, api_hash, targets))
    print("Telegram async scraper has completed its run.")
