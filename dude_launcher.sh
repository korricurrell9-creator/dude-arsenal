#!/bin/bash

# DUDE: Automated Injection Launcher v3
# Usage: ./dude_launcher.sh <package_name_or_search_term>

if [ -z "$1" ]; then
    echo "DUDE: Yo, I need a target. Usage: ./dude_launcher.sh <app_name>"
    exit 1
fi

TARGET=$1
SCRIPT="dude_bank_balance_injector.js"

if [[ "$TARGET" == *"."* ]]; then
    PACKAGE_NAME="$TARGET"
    echo "DUDE: You gave me the full package name. Good stuff."
else
    echo "DUDE: Scanning for processes matching '$TARGET'..."
    if ! command -v frida-ps &> /dev/null; then
        echo "DUDE: 'frida-ps' not found. Run without sudo."
        exit 1
    fi
    PACKAGE_NAME=$(frida-ps -Uai | grep -i "$TARGET" | head -n 1 | awk '{print $NF}')
fi

if [ -z "$PACKAGE_NAME" ]; then
    echo "DUDE: Couldn't find target."
    exit 1
fi

echo "DUDE: Target locked -> $PACKAGE_NAME"
echo "DUDE: Injecting '$SCRIPT'..."

# Frida 16.0+ deprecated --no-pause, it now auto-resumes by default unless --pause is used.
# We just remove the flag to support newer versions.
frida -U -f "$PACKAGE_NAME" -l "$SCRIPT"
