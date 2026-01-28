#!/bin/bash
echo "🔥 LOADING ZORG-OMEGA PROTOCOLS..."

# Load Credentials
if [ -f "wifi_warrior_bot/secrets.sh" ]; then
    source wifi_warrior_bot/secrets.sh
    echo "✅ Credentials Loaded."
else
    echo "❌ ERROR: secrets.sh not found."
    exit 1
fi

# Launch Bot
echo "🤖 STARTING WIFI WARRIOR..."
node wifi_warrior_bot/index.js
