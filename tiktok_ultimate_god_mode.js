/*
 * DUDE's TikTok ULTIMATE GOD MODE & GHOST PROTOCOL v2
 * 
 * Features:
 * 1. GHOST PROTOCOL: Native-level invisibility (Frida hiding).
 * 2. MASTER BYPASS: SSL Pinning, Root Detection, User Data Interception.
 * 3. GOD MODE: API Spying (Gorgon/Cookies), Prefs Dumper, UI Injection.
 */

console.log("[*] DUDE: Initializing ULTIMATE GOD MODE...");

// --- 1. GHOST PROTOCOL (Native Hooks) ---
// Using a safer method for finding symbols
try {
    var libc = Process.findModuleByName("libc.so");
    if (libc) {
        var strstrPtr = libc.findExportByName("strstr");
        if (strstrPtr) {
            Interceptor.attach(strstrPtr, {
                onEnter: function(args) {
                    try {
                        if (args[1].isNull()) return;
                        var needle = args[1].readCString();
                        if (needle && (needle.indexOf("frida") !== -1 || needle.indexOf("gum-js-loop") !== -1)) {
                            args[1].writeUtf8String("nope");
                        }
                    } catch (e) {}
                }
            });
            console.log("[+] GHOST: Native invisibility active (strstr).");
        }
    }
} catch (e) {
    console.log("[-] GHOST Protocol failed to initialize.");
}

// --- JAVA LAYER HOOKS ---
Java.perform(function () {
    console.log("[*] DUDE: Java VM attached. Deploying God Mode modules...");

    // --- 2. MASTER BYPASS MODULES ---
    function bypassSSL() {
        try {
            var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");
            TrustManagerImpl.verifyChain.implementation = function (untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
                return untrustedChain;
            };
            console.log("[+] BYPASS: SSL Pinning neutralized.");
        } catch (e) {}
    }

    function bypassRoot() {
        try {
            var File = Java.use("java.io.File");
            var rootPaths = ["/sbin/su", "/system/bin/su", "/system/xbin/su", "/data/local/xbin/su", "/data/local/su", "/su/bin/su"];
            File.exists.implementation = function () {
                var path = this.getAbsolutePath();
                if (rootPaths.indexOf(path) !== -1) return false;
                return this.exists();
            };
            console.log("[+] BYPASS: Root detection neutralized.");
        } catch (e) {}
    }

    // --- 3. GOD MODE MODULES ---
    function enableApiSpy() {
        try {
            var Request = Java.use("okhttp3.Request");
            Request.headers.overload().implementation = function () {
                var headers = this.headers();
                var urlObj = this.url();
                if (!urlObj) return headers;
                var url = urlObj.toString();
                if (url.indexOf("/aweme/v") !== -1) {
                    var gorgon = headers.get("X-Gorgon");
                    var cookie = headers.get("Cookie");
                    if (gorgon) console.log("\n[API] ⚔️ X-GORGON: " + gorgon);
                    if (cookie) console.log("[API] 🍪 COOKIE: " + cookie.substring(0, 30) + "...");
                }
                return headers;
            };
            console.log("[+] GOD MODE: API Spy active.");
        } catch (e) {}
    }

    function setupLifecycleHooks() {
        try {
            var Application = Java.use("android.app.Application");
            Application.onCreate.implementation = function() {
                this.onCreate();
                var context = this.getApplicationContext();
                
                // Show Toast
                try {
                    Java.scheduleOnMainThread(function() {
                        var Toast = Java.use("android.widget.Toast");
                        var String = Java.use("java.lang.String");
                        Toast.makeText(context, String.$new("DUDE GOD MODE ENGAGED"), 1).show();
                    });
                } catch(e) {}

                // Dump SharedPreferences
                dumpPrefs();
            };
        } catch (e) {}
    }

    function dumpPrefs() {
        try {
            var File = Java.use("java.io.File");
            var FileInputStream = Java.use("java.io.FileInputStream");
            var InputStreamReader = Java.use("java.io.InputStreamReader");
            var BufferedReader = Java.use("java.io.BufferedReader");
            
            var target = "/data/data/com.ss.android.ugc.trill/shared_prefs/aweme_user.xml";
            var prefsFile = File.$new(target);
            
            if (prefsFile.exists()) {
                console.log("\n[DATA] 📂 DUMPING " + target + ":");
                var fis = FileInputStream.$new(prefsFile);
                var isr = InputStreamReader.$new(fis);
                var br = BufferedReader.$new(isr);
                var line = "";
                while ((line = br.readLine()) !== null) {
                    console.log(line);
                }
                br.close();
                console.log("[DATA] 📂 END OF DUMP.\n");
            }
        } catch(e) {
            console.log("[-] Prefs dump failed: " + e.message);
        }
    }

    function hookUserData() {
        try {
            var User = Java.use("com.ss.android.ugc.aweme.profile.model.User");
            User.getUid.implementation = function() {
                var uid = this.getUid();
                console.log("[USER] 👤 UID: " + uid);
                return uid;
            };
            User.getNickname.implementation = function() {
                var name = this.getNickname();
                console.log("[USER] 🏷️ Name: " + name);
                return name;
            };
            console.log("[+] INTERCEPT: User Data hooks active.");
        } catch (e) {}
    }
    
    // Execute
    bypassSSL();
    bypassRoot();
    enableApiSpy();
    setupLifecycleHooks();
    hookUserData();

    console.log("[*] DUDE: Initialization Complete. Happy Hacking.");
});