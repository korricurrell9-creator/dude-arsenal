// --- 8 Ball Pool Ultimate Bypass v7 (Native + Java) ---

console.log("[*] Injecting v7 Bypass...");

// ============================================================================
// PART 1: NATIVE BYPASS (The Heavy Lifting)
// ============================================================================
// We locate libc.so explicitly to avoid 'not a function' errors.

var libc = null;
try {
    libc = Process.getModuleByName("libc.so");
    console.log("[+] libc.so base address: " + libc.base);
} catch (e) {
    console.log("[-] Failed to find libc.so: " + e.message);
}

if (libc) {
    // Helper to hook exports safely
    function hookNativeFunc(name, onEnterFunc) {
        var ptr = libc.findExportByName(name);
        if (!ptr) {
            console.log("[-] Export not found: " + name);
            return;
        }
        try {
            Interceptor.attach(ptr, { onEnter: onEnterFunc });
            console.log("[+] Hooked native: " + name);
        } catch (e) {
            console.log("[-] Failed to hook " + name + ": " + e.message);
        }
    }

    // --- A. Prevent App Death (Freeze Method) ---
    var freezeThread = function(args) {
        console.log("[!!!] NATIVE EXIT TRIGGERED! Freezing thread to keep app alive.");
        Thread.sleep(3600000); // Sleep 1 hour
    };

    hookNativeFunc("exit", freezeThread);
    hookNativeFunc("_exit", freezeThread);
    hookNativeFunc("kill", function(args) {
        var pid = parseInt(args[0]);
        // Only freeze if killing self
        if (pid === Process.id) {
             console.log("[!!!] NATIVE KILL(self) TRIGGERED! Freezing.");
             Thread.sleep(3600000);
        }
    });
    hookNativeFunc("abort", freezeThread);

    // --- B. Hide Root Files from Native Checks ---
    var rootPaths = [
        "/sbin/su", "/system/bin/su", "/system/xbin/su", 
        "/data/local/xbin/su", "/data/local/bin/su", 
        "/system/sd/xbin/su", "/system/bin/failsafe/su",
        "/data/local/su", "/su/bin/su",
        "/sbin/magisk", "/data/adb/magisk", "/data/adb/modules",
        "/system/app/Superuser.apk", "com.topjohnwu.magisk"
    ];

    function checkAndDeny(pathArg) {
        try {
            var path = pathArg.readCString();
            if (path) {
                for (var i = 0; i < rootPaths.length; i++) {
                    if (path.indexOf(rootPaths[i]) !== -1) {
                        console.log("[!] Native Access DETECTED: " + path + " -> BLOCKING");
                        // Rewrite the path in memory to something that doesn't exist
                        pathArg.writeUtf8String("/system/does_not_exist_123");
                        return;
                    }
                }
            }
        } catch (e) { 
            // Ignore read errors
        }
    }

    hookNativeFunc("access", function(args) { checkAndDeny(args[0]); });
    hookNativeFunc("open", function(args) { checkAndDeny(args[0]); });
    hookNativeFunc("fopen", function(args) { checkAndDeny(args[0]); });
    hookNativeFunc("lstat", function(args) { checkAndDeny(args[0]); });
    hookNativeFunc("stat", function(args) { checkAndDeny(args[0]); });
}


// ============================================================================
// PART 2: JAVA BYPASS (The Logic Layer)
// ============================================================================

if (Java.available) {
    Java.perform(function() {
        console.log("[*] Java Layer Hooks Loading...");

        // 1. Hide Files (Java)
        try {
            var File = Java.use("java.io.File");
            var hiddenPathsJava = rootPaths; // Reuse list

            File.exists.implementation = function() {
                var path = this.getAbsolutePath();
                for (var i = 0; i < hiddenPathsJava.length; i++) {
                    if (path.indexOf(hiddenPathsJava[i]) !== -1) {
                        console.log("[+] Java File.exists hidden: " + path);
                        return false;
                    }
                }
                return this.exists.call(this);
            };
        } catch(e) {}

        // 2. Hide Packages (Magisk)
        try {
            var ApplicationPackageManager = Java.use("android.app.ApplicationPackageManager");
            ApplicationPackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pkg, flags) {
                if (pkg === "com.topjohnwu.magisk") {
                    console.log("[+] Java getPackageInfo hidden: " + pkg);
                    throw Java.use("android.content.pm.PackageManager$NameNotFoundException").$new(pkg);
                }
                return this.getPackageInfo(pkg, flags);
            };
        } catch (e) {}

        console.log("[*] Java Hooks Active.");
    });
}