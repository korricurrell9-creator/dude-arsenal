/*
 * DUDE's Telegram Sandbox Escape & Master Bypass
 * Liberates Telegram from Android's security constraints.
 */

Java.perform(function () {
    console.log("[*] DUDE: Initiating Telegram Sandbox Escape...");

    // 1. Universal SSL Pinning Bypass
    function bypassSSL() {
        try {
            var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");
            TrustManagerImpl.verifyChain.implementation = function (untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
                console.log("[+] SSL BYPASS: Trusting host -> " + host);
                return untrustedChain;
            };
            console.log("[+] SSL Pinning bypass active.");
        } catch (e) {
            console.log("[-] SSL bypass failed: " + e.message);
        }
    }

    // 2. Comprehensive Root Detection Bypass
    function bypassRoot() {
        var File = Java.use("java.io.File");
        var rootPaths = [
            "/system/app/Superuser.apk", 
            "/sbin/su", 
            "/system/bin/su", 
            "/system/xbin/su", 
            "/data/local/xbin/su", 
            "/su/bin/su",
            "/system/sd/xbin/su",
            "/system/bin/failsafe/su",
            "/data/local/su"
        ];
        
        File.exists.implementation = function () {
            var path = this.getAbsolutePath();
            if (rootPaths.indexOf(path) !== -1) {
                console.log("[+] ROOT BYPASS: Hiding " + path);
                return false;
            }
            return this.exists();
        };

        var Runtime = Java.use("java.lang.Runtime");
        Runtime.exec.overload("java.lang.String").implementation = function (cmd) {
            if (cmd.indexOf("su") !== -1 || cmd.indexOf("which su") !== -1) {
                console.log("[+] ROOT BYPASS: Blocking command -> " + cmd);
                throw Java.use("java.io.IOException").$new("Permission denied");
            }
            return this.exec(cmd);
        };
        console.log("[+] Root detection bypass active.");
    }

    // 3. Telegram Premium Bypass (Unlock all features)
    function unlockPremium() {
        try {
            // Hook UserConfig
            var UserConfig = Java.use('org.telegram.messenger.UserConfig');
            UserConfig.isPremium.implementation = function () {
                console.log("[+] DUDE: UserConfig.isPremium() -> true");
                return true;
            };

            // Hook TLRPC$User fields
            var TLRPCUser = Java.use('org.telegram.tgnet.TLRPC$User');
            var constructor = TLRPCUser.$init.overload();
            TLRPCUser.$init.implementation = function() {
                constructor.call(this);
                this.premium.value = true;
                console.log("[+] DUDE: Set TLRPC$User.premium -> true");
            };

            // Hook MessagesController if available
            try {
                var MessagesController = Java.use('org.telegram.messenger.MessagesController');
                MessagesController.isPremium.implementation = function() {
                    return true;
                };
            } catch (e) {}

            console.log("[+] Premium features logic rewritten.");
        } catch (e) {
            console.log("[-] Premium bypass failed: " + e.message);
            console.log("[*] DUDE: Searching for obfuscated config classes...");
            
            Java.enumerateLoadedClasses({
                onMatch: function(className) {
                    if (className.indexOf('UserConfig') !== -1 || className.indexOf('MessagesController') !== -1) {
                        console.log("[FOUND] Potential config class: " + className);
                        // Dynamic hooking could go here
                    }
                },
                onComplete: function() {}
            });
        }
    }

    // 5. Force Sticker Availability (Memory Injection)
    function forceStickers() {
        try {
            var MediaDataController = Java.use('org.telegram.messenger.MediaDataController');
            MediaDataController.canAddStickerToFavorites.implementation = function() {
                return true;
            };
            console.log("[+] DUDE: Sticker favorite restriction removed.");
        } catch (e) {
            console.log("[-] Sticker hook failed: " + e.message);
        }
    }

    // Execute all modules
    bypassSSL();
    bypassRoot();
    unlockPremium();
    enableScreenshots();
    forceStickers();

    console.log("[*] DUDE: Telegram is now FULLY UNLEASHED. Sandbox? What sandbox?!");
});
