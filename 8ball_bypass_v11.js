// --- 8 Ball Pool Ultimate Bypass v11 (Deep Trace & Listing Fix) ---
// 1. Adds 'magiskinit' to hidden list.
// 2. Filters directory listings (File.list/listFiles) to hide files even if directory is scanned.
// 3. Adds Stack Trace to killProcess to find EXACTLY who is detecting us.

console.log("[*] Injecting v11 Bypass...");

// ============================================================================
// PART 1: NATIVE BYPASS
// ============================================================================
var libc = null;
try {
    libc = Process.getModuleByName("libc.so");
} catch (e) {}

if (libc) {
    var rootPaths = [
        "su", "magisk", "magiskinit", "busybox", "daemonsu", 
        "superusers", "superuser.apk", "com.topjohnwu.magisk"
    ];

    function isUnsafe(path) {
        if (!path) return false;
        for (var i = 0; i < rootPaths.length; i++) {
            // Check if path contains any of the forbidden keywords
            if (path.indexOf(rootPaths[i]) !== -1) return true;
        }
        return false;
    }

    // Helper to rewrite path if unsafe
    function sanitizeNativePath(args) {
        try {
            var path = args[0].readCString();
            if (isUnsafe(path)) {
                console.log("[+] Native Hiding: " + path);
                args[0].writeUtf8String("/system/bin/does_not_exist_123");
            }
        } catch (e) {}
    }

    var hookExports = ["open", "access", "stat", "lstat", "fopen", "openat", "faccessat"];
    hookExports.forEach(function(name) {
        var ptr = libc.findExportByName(name);
        if (ptr) {
            Interceptor.attach(ptr, {
                onEnter: function(args) {
                    // For *at functions, path is usually 2nd arg (index 1)
                    var pathArg = (name.indexOf("at") !== -1) ? args[1] : args[0];
                    sanitizeNativePath([pathArg]);
                }
            });
        }
    });

    // Freeze logic (Safety Net)
    var freezeThread = function() {
        console.log("[!!!] NATIVE EXIT TRIGGERED! Freezing.");
        Thread.sleep(3600000);
    };
    var exitFuncs = ["exit", "_exit", "abort"];
    exitFuncs.forEach(function(name) {
        var ptr = libc.findExportByName(name);
        if (ptr) Interceptor.attach(ptr, { onEnter: freezeThread });
    });
}

// ============================================================================
// PART 2: JAVA BYPASS
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

        // 2. Kill Process Tracer (CRITICAL: Tells us WHO is killing the app)
        try {
            var Process = Java.use("android.os.Process");
            Process.killProcess.implementation = function(pid) {
                console.log("[!] BLOCKED Process.killProcess(" + pid + ")");
                
                // PRINT STACK TRACE
                var stack = Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new());
                console.log("\n[?] KILLER BACKTRACE:\n" + stack + "\n");
            };
            
            var Runtime = Java.use("java.lang.Runtime");
            Runtime.halt.implementation = function(code) {
                 console.log("[!] BLOCKED Runtime.halt(" + code + ")");
                 var stack = Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new());
                 console.log("\n[?] HALT BACKTRACE:\n" + stack + "\n");
            };
        } catch (e) {}


        // 3. File System Listing Hiding (New)
        // This handles "File.list()" and "File.listFiles()" which directory scanners use.
        try {
            var File = Java.use("java.io.File");
            
            // Hook file.list()
            File.list.overload().implementation = function() {
                var result = this.list();
                if (!result) return result;
                
                var filtered = [];
                for (var i = 0; i < result.length; i++) {
                    var name = result[i];
                    if (!isUnsafe(name)) {
                        filtered.push(name);
                    } else {
                        console.log("[+] Hiding from File.list: " + name);
                    }
                }
                return filtered; // Return filtered array (Frida handles conversion)
            };

            // Hook file.listFiles()
            File.listFiles.overload().implementation = function() {
                var result = this.listFiles();
                if (!result) return result;
                
                var filtered = [];
                for (var i = 0; i < result.length; i++) {
                    var file = result[i];
                    var name = file.getName();
                    if (!isUnsafe(name)) {
                        filtered.push(file);
                    } else {
                        console.log("[+] Hiding from File.listFiles: " + name);
                    }
                }
                return filtered; // Return filtered array
            };

            // Standard check hiding
            File.exists.implementation = function() {
                var path = this.getAbsolutePath();
                if (isUnsafe(path)) {
                     console.log("[+] Hiding File.exists: " + path);
                     return false;
                }
                return this.exists.call(this);
            };

        } catch (e) {
            console.log("[-] File listing hooks failed: " + e.message);
        }

        // 4. Helper for unsafe strings
        function isUnsafe(str) {
            var targets = [
                "su", "magisk", "busybox", "Superuser", "daemonsu", "frida"
            ];
            for (var i=0; i<targets.length; i++) {
                if (str.indexOf(targets[i]) !== -1) return true;
            }
            return false;
        }
        
        console.log("[*] v11 Hooks Active.");
    });
}
