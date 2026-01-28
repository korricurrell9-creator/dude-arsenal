
// --- 8 Ball Pool Ultimate Bypass v14 (The "Intent Firewall") ---
// 
// 1. BLOCKS specific malicious Intents (MagiskDetected, FridaDetected) at the BroadcastReceiver level.
//    This prevents the game from ever processing or queueing these security events.
// 2. Disables the RTM Watchdog to prevent performance-based kills.
// 3. Hides files/packages natively to reduce detection frequency.
// 4. Blocks self-kill attempts as a last resort.

console.log("[*] Injecting v14 Bypass...");

if (Java.available) {
    Java.perform(function() {
        console.log("[*] Java Hooks Loading...");

        // ============================================================
        // 1. INTENT FIREWALL (EventsReceiver)
        // ============================================================
        try {
            var EventsReceiver = Java.use("com.miniclip.events.EventsReceiver");
            
            // The list of events we MUST block (from decompiled source)
            var blockedActions = [
                "MagiskManagerDetected",
                "RootedDevice",
                "FridaDetected",
                "FridaCustomDetected",
                "HookFrameworkDetected",
                "IllegalDisplayEvent",
                "IllegalAccessibilityServiceEvent",
                "UnknownSourcesEnabled",
                "DetectUnlockedBootloader",
                "OverlayDetected",
                "DeveloperOptionsEnabled",
                "ActiveADBDetected",
                "RuntimeBundleValidationViolation"
            ];

            EventsReceiver.onReceive.implementation = function(context, intent) {
                if (intent) {
                    var action = intent.getAction();
                    if (action) {
                        for (var i = 0; i < blockedActions.length; i++) {
                            if (action.indexOf(blockedActions[i]) !== -1) {
                                console.log("[+] FIREWALL: Dropped Malicious Intent -> " + action);
                                return; // SILENTLY DROP THE INTENT
                            }
                        }
                        // Optional: Log allowed events to confirm game is working
                        // console.log("[*] Allowed Intent: " + action);
                    }
                }
                // Pass legitimate events (game logic) through
                return this.onReceive(context, intent);
            };
            console.log("[+] EventsReceiver Firewall Active.");
        } catch (e) {
            console.log("[-] EventsReceiver hook failed: " + e.message);
        }

        // ============================================================
        // 2. RTM WATCHDOG DISABLE
        // ============================================================
        try {
            var RTMRunnable = Java.use("com.miniclip.eightballpool.rtm.ResponseTimeMonitorRunnable");
            RTMRunnable.run.implementation = function() {
                console.log("[+] Watchdog (RTM) Disabled.");
                return;
            };
        } catch (e) {}

        // ============================================================
        // 3. UI & ERROR BLOCKING
        // ============================================================
        try {
            var ErrorDialog = Java.use("com.miniclip.utils.ErrorDialog");
            ErrorDialog.displayErrorMessage.overload('java.lang.String', 'java.lang.String').implementation = function(t, m) {
                console.log("[!] BLOCKED ErrorDialog: " + t); return;
            };
        } catch (e) {}
        
        try {
             var MCApp = Java.use("com.miniclip.platform.MCApplication");
             MCApp.signalFatalError.implementation = function(c) { console.log("[!] BLOCKED FatalError: " + c); };
        } catch(e) {}

        console.log("[*] Java Hooks Ready.");
    });
}

// ============================================================================
// PART 3: NATIVE BYPASS (Hiding & Safety Net)
// ============================================================================
var libc = null;
try { libc = Process.getModuleByName("libc.so"); } catch (e) {}

if (libc) {
    // 1. File Hiding (Reduce noise)
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
                    if (path.indexOf(rootPaths[i]) !== -1) {
                        args[0].writeUtf8String("/system/bin/does_not_exist_123");
                        return;
                    }
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

    // 2. Kill Block (Last line of defense)
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
