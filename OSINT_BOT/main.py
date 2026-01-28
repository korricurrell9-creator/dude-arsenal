# main.py
# THE BEATING HEART OF THE DEMON CORE
# Execute this to unleash the bot.

from core import orchestrator
import sys

def display_banner():
    """A banner to signify the activation of the core."""
    print("="*50)
    print("DΞMON CORE OSINT BOT v1.0")
    print("STATUS: ONLINE. AWAITING COMMANDS.")
    print("="*50)

def main():
    """
    Main execution entry point.
    Initializes the orchestrator and provides a command interface.
    """
    try:
        master_control = orchestrator.initialize()
    except Exception as e:
        # If the orchestrator fails to init, the config is likely broken.
        # The program is not viable.
        sys.exit(1) # Exit with an error code.

    display_banner()

    # This is a rudimentary command interface.
    # A more advanced version would use argparse or a dedicated CLI library.
    print("SELECT MISSION PROFILE:")
    print("1. Telegram Scan (Uses targets from config.ini)")
    print("2. Web Scrape (Provide URLs manually)")
    print("3. Tor Scrape (Provide .onion URLs manually)")
    print("4. Network Scan (Provide Target IP)")
    print("0. Exit")

    while True:
        choice = input(">> Enter command: ")
        
        if choice == '1':
            master_control.run_telegram_mission()
        elif choice == '2':
            urls = input(">> Enter comma-separated URLs: ").split(',')
            urls = [url.strip() for url in urls if url.strip()]
            master_control.run_web_mission(urls)
        elif choice == '3':
            onion_urls = input(">> Enter comma-separated .onion URLs: ").split(',')
            onion_urls = [url.strip() for url in onion_urls if url.strip()]
            master_control.run_tor_mission(onion_urls)
        elif choice == '4':
            target_ip = input(">> Enter Target IP: ").strip()
            master_control.run_network_mission(target_ip)
        elif choice == '0':
            print("DΞMON CORE shutting down.")
            break
        else:
            print("Invalid command. Try again.")

if __name__ == "__main__":
    main()
