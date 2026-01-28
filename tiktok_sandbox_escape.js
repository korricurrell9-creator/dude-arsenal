/*
 * DUDE's TikTok Sandbox Escape & Master Bypass
 * Specifically tuned for TikTok on rooted devices.
 */

Java.perform(function () {
    console.log("[*] DUDE: Initiating TikTok Sandbox Escape...");

    // 1. SSL Pinning Bypass (Essential for network 'freedom')
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

    // 2. Root Detection Bypass (Prevents the app from 'knowing' it's rooted)
    function bypassRoot() {
        var File = Java.use("java.io.File");
        var rootPaths = ["/system/app/Superuser.apk", "/sbin/su", "/system/bin/su", "/system/xbin/su", "/data/local/xbin/su", "/su/bin/su"];
        
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
            if (cmd.indexOf("su") !== -1) {
                console.log("[+] ROOT BYPASS: Blocking command -> " + cmd);
                throw Java.use("java.io.IOException").$new("Permission denied");
            }
            return this.exec(cmd);
        };
        console.log("[+] Root detection bypass active.");
    }

    // 3. Anti-Debugging & Exit Prevention
    function bypassAntiDebug() {
        var System = Java.use("java.lang.System");
        System.exit.implementation = function (status) {
            console.log("[+] EXIT BYPASS: Prevented TikTok from closing (Status: " + status + ")");
            return;
        };

        var Thread = Java.use("java.lang.Thread");
        Thread.suspend.implementation = function () {
            console.log("[+] SUSPEND BYPASS: Ignoring thread suspension.");
            return;
        };
        console.log("[+] Anti-debug bypass active.");
    }

    // 4. Recon: Proving the sandbox is "free" by intercepting data
    function setupRecon() {
        try {
            var User = Java.use("com.ss.android.ugc.aweme.profile.model.User");
            User.getUid.implementation = function() {
                var uid = this.getUid();
                console.log("[DATA] Intercepted TikTok UID: " + uid);
                return uid;
            };
            console.log("[+] TikTok Data Interception active.");
        } catch (e) {
            console.log("[-] Recon setup failed (likely obfuscated): " + e.message);
        }
    }

    // Execute modules
    bypassSSL();
    bypassRoot();
    bypassAntiDebug();
    setupRecon();

    console.log("[*] DUDE: TikTok is now FREE from its sandbox. Happy hacking!");
});
