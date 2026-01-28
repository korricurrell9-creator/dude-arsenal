#!/bin/bash

# DUDE FORENSIC SETUP SCRIPT
# For Samsung SM-T590

echo "DUDE: Initializing Forensic Workstation Setup..."

# 1. Verify ADB Connection
echo "DUDE: Checking for ADB connection to the tablet..."
if ! command -v adb &> /dev/null; then
    echo "DUDE: ADB is missing! You need to install android-tools or platform-tools."
else
    adb devices
    echo "DUDE: If you see your device above, we are in business."
fi

# 2. Prepare the Bypass Launcher
# This creates a shortcut to run the ultimate bypass script easily
echo "DUDE: Forging the 'dude-bypass' command weapon..."

cat << 'EOF' > dude-inject
#!/bin/bash
TARGET_PKG=$1

if [ -z "$TARGET_PKG" ]; then
    echo "DUDE: You forgot the package name! Usage: ./dude-inject <com.example.app>"
    exit 1
fi

if [ ! -f "dude_ultimate_bypass.js" ]; then
    echo "DUDE: Where is dude_ultimate_bypass.js? I can't find it!"
    exit 1
fi

echo "DUDE: Smashing protections on $TARGET_PKG..."
# We assume the user has activated the objection-env or has frida installed globally
frida -U -f "$TARGET_PKG" -l $(pwd)/dude_ultimate_bypass.js
EOF

chmod +x dude-inject
echo "DUDE: 'dude-inject' created. Usage: ./dude-inject <package_name>"

# 3. Environment Reminder
echo "DUDE: Setup checklist complete."
echo "1. Connect the SM-T590 via USB."
echo "2. Activate your tools: source objection-env/bin/activate"
echo "3. Run: ./dude-inject com.suspect.app"
