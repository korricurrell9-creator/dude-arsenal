// tiktok_recon.js
Java.perform(function() {
    console.log("[*] DUDE's Recon Script Started - Let's see what we can find...");

    // 1. Hooking UI Text - Captures what appears on screen (Usernames, Bios, Messages)
    try {
        var TextView = Java.use("android.widget.TextView");
        TextView.setText.overload('java.lang.CharSequence').implementation = function(text) {
            var str = text ? text.toString() : "";
            // Filter out empty or very short strings to reduce noise
            if (str.length > 1) { 
                console.log("[UI Display] " + str);
            }
            this.setText(text);
        };
    } catch(e) { console.log("[!] TextView hook failed: " + e.message); }

    // 2. Hooking SharedPreferences - Captures data saved to disk (Session IDs, Settings)
    // Note: Implementation class names can vary by Android version. 
    try {
        var SharedPreferencesEditor = Java.use("android.app.SharedPreferencesImpl$EditorImpl");
        SharedPreferencesEditor.putString.implementation = function(key, value) {
            console.log("[Prefs Save] Key: " + key + " | Value: " + value);
            return this.putString(key, value);
        };
    } catch(e) { 
        console.log("[-] Standard SharedPreferencesImpl hook failed (normal on some Android versions).");
    }

    // 3. Attempting to hook specific TikTok User Model
    // Common class path for TikTok's user model. May change with updates/obfuscation.
    try {
        var UserClass = Java.use("com.ss.android.ugc.aweme.profile.model.User");
        console.log("[+] JACKPOT: Found 'com.ss.android.ugc.aweme.profile.model.User'!");
        
        // Hook common getters if they exist
        var methods = ['getUid', 'getNickname', 'getShortId', 'getSecUid', 'getBirthday'];
        
        methods.forEach(function(m) {
            try {
                UserClass[m].implementation = function() {
                    var ret = this[m]();
                    console.log("[User Data] " + m + ": " + ret);
                    return ret;
                };
            } catch(err) {}
        });

    } catch(e) {
        console.log("[-] Target User class not found directly. The class name might be obfuscated (e.g., 'com.ss.android.ugc.aweme.profile.model.a').");
        console.log("    [*] Recommendation: Use the discovery script to find the exact obfuscated name.");
    }
    
    // 4. Hook Clipboard to see copied text
    try {
        var ClipboardManager = Java.use("android.content.ClipboardManager");
        ClipboardManager.setPrimaryClip.implementation = function(clipData) {
            console.log("[Clipboard] Copied: " + clipData.toString());
            return this.setPrimaryClip(clipData);
        }
    } catch(e) {}

});
