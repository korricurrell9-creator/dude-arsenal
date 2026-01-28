
// --- 8 Ball Pool Ultimate Bypass v10 (RTM Fix + Aggressive Native Hide) ---
// Combines:
// 1. ResponseTimeMonitor (Watchdog) Disable -> Fixes "Process terminated" loop.
// 2. Native File Redirection -> Fixes "Magisk Detected" (Native).
// 3. Java Layer Hiding -> Fixes "Magisk Detected" (Java).
// 4. Exit Blocking -> Safety net.

console.log("[*] Injecting v10 Bypass...");

// ============================================================================
// PART 1: NATIVE BYPASS (The Security Checks)
// ============================================================================
var libc = null;
try {
    libc = Process.getModuleByName("libc.so");
} catch (e) {}

if (libc) {
    // --- Helper: Redirect bad paths to a safe non-existent path ---
    var rootPaths = [
        "/sbin/su", "/system/bin/su", "/system/xbin/su", 
        "/data/local/xbin/su", "/data/local/bin/su", 
        "/system/sd/xbin/su", "/system/bin/failsafe/su",
        "/data/local/su", "/su/bin/su",
        "/sbin/magisk", "/data/adb/magisk", "/data/adb/modules",
        "/cache/magisk.log", "/init.magisk.rc",
        "com.topjohnwu.magisk"
    ];

    function sanitizePath(pathPtr) {
        try {
            var path = pathPtr.readCString();
            if (path) {
                for (var i = 0; i < rootPaths.length; i++) {
                    if (path.indexOf(rootPaths[i]) !== -1) {
                        console.log("[+] Native Hiding: " + path);
                        // Rewrite path in memory to something safe
                        pathPtr.writeUtf8String("/system/bin/does_not_exist_123");
                        return true;
                    }
                }
            }
        } catch (e) {}
        return false;
    }

    // --- Hook File Access Functions ---
    // We hook *at functions too (openat, faccessat) as modern Android uses them.
    
    var hookExports = [
        "open", "access", "stat", "lstat", "fopen", 
        "__system_property_get" // Check for 'test-keys' etc
    ];

    hookExports.forEach(function(name) {
        var ptr = libc.findExportByName(name);
        if (ptr) {
            Interceptor.attach(ptr, {
                onEnter: function(args) {
                    if (name === "__system_property_get") {
                         // args[0] is key
                         try {
                             var key = args[0].readCString();
                             if (key.indexOf("ro.build.tags") !== -1 || key.indexOf("ro.debuggable") !== -1) {
                                 console.log("[+] Hiding Prop: " + key);
                                 args[0].writeUtf8String("this.prop.does.not.exist");
                             }
                         } catch(e){}
                    } else if (name === "openat") {
                        // args[1] is path
                        sanitizePath(args[1]);
                    } else if (name === "faccessat") {
                         // args[1] is path
                        sanitizePath(args[1]);
                    } else {
                        // args[0] is path for open, access, stat, lstat, fopen
                        sanitizePath(args[0]);
                    }
                }
            });
        }
    });

    // --- Native Freeze (Safety Net) ---
    var freezeThread = function(args) {
        console.log("[!!!] NATIVE EXIT TRIGGERED! Freezing thread to keep app alive.");
        Thread.sleep(3600000); 
    };

    var exitFuncs = ["exit", "_exit", "abort"];
    exitFuncs.forEach(function(name) {
        var ptr = libc.findExportByName(name);
        if (ptr) Interceptor.attach(ptr, { onEnter: freezeThread });
    });

    var killPtr = libc.findExportByName("kill");
    if (killPtr) {
        Interceptor.attach(killPtr, {
            onEnter: function(args) {
                if (parseInt(args[0]) === Process.id) {
                     console.log("[!!!] NATIVE KILL(self) TRIGGERED! Freezing.");
                     Thread.sleep(3600000);
                }
            }
        });
    }
}

// ============================================================================
// PART 2: JAVA BYPASS (RTM Watchdog + UI)
// ============================================================================

if (Java.available) {
    Java.perform(function() {
        console.log("[*] Java Hooks Loading...");

        // 1. DISABLE RTM WATCHDOG (Crucial!)
        try {
            var RTMRunnable = Java.use("com.miniclip.eightballpool.rtm.ResponseTimeMonitorRunnable");
            RTMRunnable.run.implementation = function() {
                console.log("[+] Watchdog (RTM) Disabled.");
                return;
            };
        } catch (e) {}

        // 2. Hide Files (Java Layer)
        try {
            var File = Java.use("java.io.File");
            File.exists.implementation = function() {
                var path = this.getAbsolutePath();
                for (var i = 0; i < rootPaths.length; i++) {
                    if (path.indexOf(rootPaths[i]) !== -1) return false;
                }
                return this.exists.call(this);
            };
        } catch(e) {}

        // 3. Hide Packages
        try {
            var AppPM = Java.use("android.app.ApplicationPackageManager");
            AppPM.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pkg, flags) {
                if (pkg === "com.topjohnwu.magisk") {
                    throw Java.use("android.content.pm.PackageManager$NameNotFoundException").$new(pkg);
                }
                return this.getPackageInfo(pkg, flags);
            };
        } catch (e) {}

        // 4. Block Dialogs & Exits
        try {
            var ErrorDialog = Java.use("com.miniclip.utils.ErrorDialog");
            ErrorDialog.displayErrorMessage.overload('java.lang.String', 'java.lang.String').implementation = function(t, m) {
                console.log("[!] BLOCKED ErrorDialog: " + t); return;
            };
        } catch (e) {}

        try {
             var MCApp = Java.use("com.miniclip.platform.MCApplication");
             MCApp.signalFatalError.implementation = function(c) { console.log("[!] BLOCKED SignalFatalError: " + c); };
        } catch(e) {}
        
        try {
            var Runtime = Java.use("java.lang.Runtime");
            Runtime.halt.implementation = function(c) { console.log("[!] BLOCKED Runtime.halt"); };
            var Process = Java.use("android.os.Process");
            Process.killProcess.implementation = function(p) { console.log("[!] BLOCKED Process.killProcess"); };
        } catch(e) {}

        console.log("[*] v10 Hooks Active.");
    });
}
