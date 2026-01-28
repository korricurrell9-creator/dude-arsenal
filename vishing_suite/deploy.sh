#!/bin/bash
# ZORG-OMEGA: ASTERISK DEPLOYMENT SCRIPT

echo "🚀 Deploying Vishing Suite..."

# Copy configurations
cp /usr/lib/gemini-cli/vishing_suite/extensions.conf /etc/asterisk/
cp /usr/lib/gemini-cli/vishing_suite/sip.conf /etc/asterisk/

# Set permissions
chown -R asterisk:asterisk /etc/asterisk/

# Reload Asterisk
asterisk -rx "dialplan reload"
asterisk -rx "sip reload"

echo "✅ Asterisk is now armed with the Social Engineering Context."
