
// --- 8 Ball Pool Ultimate Bypass v13 (The "Chokepoint" Strategy) ---
// 
// 1. Hooks 'EventsReceiver.sendBlobsNative' to drop detection reports before they reach the game core.
// 2. Restores Native File Hiding (libc) with safer filters.
// 3. Keeps RTM Watchdog disabled.
// 4. Keeps Native Freeze as safety net.

console.log("[*] Injecting v13 Bypass...");

// ============================================================================
// PART 1: JAVA LAYER (The Logic & Reporting)
// ============================================================================
if (Java.available) {
    Java.perform(function() {
        console.log("[*] Java Hooks Loading...");

        // 1. RTM Watchdog Disable
        try {
            var RTMRunnable = Java.use("com.miniclip.eightballpool.rtm.ResponseTimeMonitorRunnable");
            RTMRunnable.run.implementation = function() {
                console.log("[+] Watchdog (RTM) Disabled.");
                return; 
            };
        } catch (e) {}

        // 2. INTERCEPT REPORTING (The Chokepoint)
        // We hook the native method call from Java. This is where the app sends
        // "MagiskDetected" or "RootedDevice" to the C++ game engine.
        try {
            var EventsReceiver = Java.use("com.miniclip.events.EventsReceiver");
            
            EventsReceiver.sendBlobsNative.implementation = function(b1, b2) {
                // Convert byte arrays to strings for inspection
                var s1 = "";
                var s2 = "";
                try {
                    // Quick & dirty byte-to-string
                    if (b1) s1 = Java.use("java.lang.String").$new(b1).toString();
                    if (b2) s2 = Java.use("java.lang.String").$new(b2).toString();
                } catch(e) {}

                var combined = s1 + s2;
                
                // Check for forbidden keywords
                if (combined.indexOf("Magisk") !== -1 || 
                    combined.indexOf("Root") !== -1 || 
                    combined.indexOf("Frida") !== -1 || 
                    combined.indexOf("Hook") !== -1 ||
                    combined.indexOf("BusyBox") !== -1) {
                    
                    console.log("[!] BLOCKED REPORTING to Native: " + combined.substring(0, 50) + "...");
                    return; // Drop it!
                }
                
                // Allow safe blobs
                return this.sendBlobsNative(b1, b2);
            };
            console.log("[+] EventsReceiver.sendBlobsNative hooked.");
        } catch (e) {
            console.log("[-] Failed to hook sendBlobsNative: " + e.message);
        }

        // 3. Block Dialogs
        try {
            var ErrorDialog = Java.use("com.miniclip.utils.ErrorDialog");
            ErrorDialog.displayErrorMessage.overload('java.lang.String', 'java.lang.String').implementation = function(t, m) {
                console.log("[!] BLOCKED ErrorDialog: " + t); return;
            };
        } catch (e) {}

        console.log("[*] Java Hooks Active.");
    });
}

// ============================================================================
// PART 2: NATIVE LAYER (File Hiding & Freeze)
// ============================================================================
var libc = null;
try { libc = Process.getModuleByName("libc.so"); } catch (e) {}

if (libc) {
    // A. File Hiding
    var rootPaths = [
        "/sbin/su", "/system/bin/su", "/system/xbin/su", 
        "/data/local/xbin/su", "/data/local/bin/su", 
        "/system/sd/xbin/su", "/system/bin/failsafe/su",
        "/data/local/su", "/su/bin/su",
        "/sbin/magisk", "/data/adb/magisk", "/data/adb/modules",
        "/cache/magisk.log", "/init.magisk.rc",
        "com.topjohnwu.magisk"
    ];

    function checkPath(args) {
        try {
            var path = args[0].readCString();
            if (path) {
                for (var i = 0; i < rootPaths.length; i++) {
                    // Strict check to avoid false positives (like "support")
                    if (path === rootPaths[i] || path.startsWith(rootPaths[i] + "/")) {
                        console.log("[+] Native Hiding: " + path);
                        args[0].writeUtf8String("/system/bin/does_not_exist_123");
                        return;
                    }
                }
                // Special check for keywords if strict fails
                if (path.indexOf("magisk") !== -1) {
                     console.log("[+] Native Hiding (Keyword): " + path);
                     args[0].writeUtf8String("/system/bin/does_not_exist_123");
                }
            }
        } catch (e) {}
    }

    var hookExports = ["open", "access", "stat", "lstat", "fopen", "openat", "faccessat"];
    hookExports.forEach(function(name) {
        var ptr = libc.findExportByName(name);
        if (ptr) {
            Interceptor.attach(ptr, {
                onEnter: function(args) {
                    var pathArg = (name.indexOf("at") !== -1) ? args[1] : args[0];
                    checkPath([pathArg]);
                }
            });
        }
    });

    // B. Freeze (Safety Net)
    var killPtr = libc.findExportByName("kill");
    if (killPtr) {
        Interceptor.attach(killPtr, {
            onEnter: function(args) {
                if (parseInt(args[0]) === Process.id) {
                     console.log("[!!!] NATIVE KILL(self) DETECTED! Freezing.");
                     Thread.sleep(3600000);
                }
            }
        });
    }
}
