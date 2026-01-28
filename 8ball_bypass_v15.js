// --- 8 Ball Pool Ultimate Bypass v15 (Trace & Destroy) ---
// 
// 1. Hooks MCApplication.isDeviceRooted() to pass the Java check found in source.
// 2. Hooks Firebase Crashlytics isRooted() to clean up reports.
// 3. Implements the "Intent Firewall" from v14 (EventsReceiver).
// 4. Disables RTM Watchdog.
// 5. Native: Adds Backtrace to kill() to identify the exact library causing the exit.
// 6. Native: Hides root files.

console.log("[*] Injecting v15 Bypass...");

if (Java.available) {
    Java.perform(function() {
        console.log("[*] Java Hooks Loading...");

        // 1. MCApplication Root Check
        try {
            var MCApp = Java.use("com.miniclip.platform.MCApplication");
            MCApp.isDeviceRooted.implementation = function() {
                console.log("[+] Bypassed MCApplication.isDeviceRooted ()");
                return false;
            };
        } catch (e) {
            console.log("[-] MCApp hook failed: " + e.message);
        }

        // 2. Firebase Crashlytics Root Check
        try {
            var CommonUtils = Java.use("com.google.firebase.crashlytics.internal.common.CommonUtils");
            CommonUtils.isRooted.implementation = function(ctx) {
                // console.log("[+] Bypassed Crashlytics.isRooted ()");
                return false;
            };
        } catch (e) {
            // Ignore, might be obfuscated or missing
        }

        // 3. EventsReceiver Firewall
        try {
            var EventsReceiver = Java.use("com.miniclip.events.EventsReceiver");
            var blockedActions = [
                "MagiskManagerDetected", "RootedDevice", "FridaDetected", 
                "FridaCustomDetected", "HookFrameworkDetected", 
                "IllegalDisplayEvent", "IllegalAccessibilityServiceEvent", 
                "UnknownSourcesEnabled", "DetectUnlockedBootloader", 
                "OverlayDetected", "DeveloperOptionsEnabled", 
                "ActiveADBDetected", "RuntimeBundleValidationViolation"
            ];

            EventsReceiver.onReceive.implementation = function(context, intent) {
                if (intent) {
                    var action = intent.getAction();
                    if (action) {
                        for (var i = 0; i < blockedActions.length;
 i++) {
                            if (action.indexOf(blockedActions[i]) !== -1) {
                                console.log("[+] FIREWALL: Dropped Intent -> " + action);
                                return;
                            }
                        }
                    }
                }
                return this.onReceive(context, intent);
            };
        } catch (e) {
            console.log("[-] EventsReceiver hook failed: " + e.message);
        }

        // 4. RTM Watchdog Disable
        try {
            var RTMRunnable = Java.use("com.miniclip.eightballpool.rtm.ResponseTimeMonitorRunnable");
            RTMRunnable.run.implementation = function() {
                console.log("[+] Watchdog (RTM) Disabled.");
                return;
            };
        } catch(e) {}

        // 5. Block Native UI (Dialogs)
        try {
            var CocoJava = Java.use("com.miniclip.nativeJNI.cocojava");
            CocoJava.showDialog.implementation = function(i, str, str2, z, strArr) {
                if (str.indexOf("Security") !== -1 || str2.indexOf("risk") !== -1 || str2.indexOf("threat") !== -1) {
                    console.log("[!] BLOCKED Security Dialog: " + str);
                    return;
                }
                return this.showDialog(i, str, str2, z, strArr);
            };
            CocoJava.showMessageBox.implementation = function(i, str, str2, z, strArr) {
                if (str.indexOf("Security") !== -1 || str2.indexOf("risk") !== -1) {
                    console.log("[!] BLOCKED Security MessageBox: " + str);
                    return;
                }
                return this.showMessageBox(i, str, str2, z, strArr);
            };
        } catch(e) {}

        console.log("[*] Java Hooks Active.");
    });
}

// ============================================================================ 
// PART 2: NATIVE LAYER
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
                for (var i = 0; i < rootPaths.length;
 i++) {
                    if (path.indexOf(rootPaths[i]) !== -1) {
                        // console.log("[+] Native Hiding: " + path);
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

    // B. KILL TRACER (Essential)
    var killPtr = libc.findExportByName("kill");
    if (killPtr) {
        Interceptor.attach(killPtr, {
            onEnter: function(args) {
                var pid = parseInt(args[0]);
                if (pid === Process.id) {
                     console.log("\n[!!!] NATIVE KILL(self) DETECTED!");
                     console.log("---------------------------------------------------");
                     // PRINT NATIVE BACKTRACE
                     console.log(Thread.backtrace(this.context, Backtracer.ACCURATE)
                        .map(DebugSymbol.fromAddress).join('\n'));
                     console.log("---------------------------------------------------");
                     console.log("[!] Freezing thread...");
                     Thread.sleep(3600000);
                }
            }
        });
    }
    
    var exitPtr = libc.findExportByName("exit");
    if (exitPtr) {
         Interceptor.attach(exitPtr, {
            onEnter: function(args) {
                 console.log("\n[!!!] NATIVE EXIT(" + args[0] + ") DETECTED!");
                 console.log(Thread.backtrace(this.context, Backtracer.ACCURATE)
                    .map(DebugSymbol.fromAddress).join('\n'));
                 console.log("[!] Freezing thread...");
                 Thread.sleep(3600000);
            }
        });
    }
}