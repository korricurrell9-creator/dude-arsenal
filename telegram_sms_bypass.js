// DUDE's Telegram SMS & Restriction Bypass
// Combines Root Detection Bypass, Premium Unlock, and Auto-Launch Intent for SMS/Compose

console.log("[*] DUDE's Telegram SMS Bypass Loaded");

Java.perform(function () {
    console.log("[*] Java VM ready. Initializing bypasses...");

    // --- 1. Root Detection Bypass (Generic) ---
    try {
        const File = Java.use('java.io.File');
        const rootPaths = [
            "/system/app/Superuser.apk", "/sbin/su", "/system/bin/su", "/system/xbin/su",
            "/data/local/xbin/su", "/data/local/bin/su", "/system/sd/xbin/su",
            "/system/bin/failsafe/su", "/data/local/su", "/su/bin/su"
        ];

        File.exists.implementation = function () {
            const path = this.getAbsolutePath();
            if (rootPaths.indexOf(path) > -1) {
                console.log(`[+] ROOT BYPASS: Hiding file ${path}`);
                return false;
            }
            return this.exists.call(this);
        };

        const Runtime = Java.use('java.lang.Runtime');
        const execOverloads = Runtime.getRuntime().exec.overloads;
        execOverloads.forEach(overload => {
            overload.implementation = function (...args) {
                let cmd = args[0];
                if (Array.isArray(cmd)) cmd = cmd.join(' ');
                if (cmd && cmd.includes('su')) {
                    console.log(`[+] ROOT BYPASS: Blocking command: ${cmd}`);
                    throw Java.use("java.io.IOException").$new("Permission denied");
                }
                return overload.apply(this, args);
            };
        });
        console.log("[+] Root detection bypass active.");
    } catch (e) {
        console.error(`[!] Root bypass error: ${e.message}`);
    }

    // --- 2. Telegram Premium Bypass ---
    try {
        const UserConfig = Java.use('org.telegram.messenger.UserConfig');
        if (UserConfig.isPremium) {
            UserConfig.isPremium.implementation = function () {
                console.log("[+] PREMIUM BYPASS: Returning true for isPremium()");
                return true;
            };
            console.log("[+] Premium bypass active.");
        } else {
            console.warn("[!] UserConfig.isPremium not found (might be obfuscated or different version).");
        }
    } catch (e) {
        console.warn(`[!] Premium bypass error: ${e.message}`);
    }

    // --- 3. Launch "Create SMS" / Compose Intent ---
    // We hook Activity.onResume to trigger our intent once the app is visible
    try {
        const Activity = Java.use('android.app.Activity');
        const Intent = Java.use('android.content.Intent');
        const Uri = Java.use('android.net.Uri');

        let launched = false;

        Activity.onResume.implementation = function () {
            this.onResume(); // Call original first

            if (!launched) {
                console.log("[*] Activity resumed. Attempting to launch SMS intent...");
                
                try {
                    // METHOD A: Generic SMS View Intent (if Telegram handles it)
                    // const uri = Uri.parse("sms:");
                    // const intent = Intent.$new("android.intent.action.VIEW", uri);
                    
                    // METHOD B: Telegram specific "Share" or "Compose"
                    // Since "Create SMS" is ambiguous, we'll try to launch the default Telegram "New Message" flow
                    // or share text to it.
                    
                    // Let's try to construct an Intent that forces the 'New Message' screen.
                    // Usually sending a text via SEND intent works best to open the contact picker.
                    
                    const intent = Intent.$new("android.intent.action.SEND");
                    intent.setType("text/plain");
                    intent.putExtra("android.intent.extra.TEXT", "Hello from DUDE bypass!");
                    intent.setPackage("org.telegram.messenger"); // Force it to open in Telegram
                    
                    // Verify if context is valid
                    const context = this; 
                    console.log("[+] Starting activity with intent: " + intent);
                    context.startActivity(intent);
                    
                    launched = true;
                    console.log("[+] SMS/Compose Intent Launched successfully!");
                    
                } catch (err) {
                    console.error("[!] Failed to launch intent: " + err.message);
                }
            }
        };
    } catch (e) {
        console.error(`[!] Intent launch hook error: ${e.message}`);
    }
});
