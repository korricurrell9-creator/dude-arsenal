// --- 8 Ball Pool Ultimate Bypass v6 (Debug & Fix) ---
console.log("[*] Injecting v6 Bypass...");

// Helper to safely hook native functions
function hookNative(lib, func, callback) {
    try {
        var ptr = Module.findExportByName(lib, func);
        if (!ptr) {
            console.log("[-] Export not found: " + func);
            return;
        }
        
        console.log("[+] Found " + func + " at " + ptr);
        
        // Use Interceptor.replace for exit functions to cleanly take over
        // We need to know the signature. exit(int status) -> void
        
        if (func === "exit" || func === "_exit") {
            try {
                var nativeCallback = new NativeCallback(function(status) {
                    console.log("[!] NATIVE BLOCK: " + func + "(" + status + ") called. Sleeping thread.");
                    Thread.sleep(3600000); // 1 hour sleep
                }, 'void', ['int']);
                
                Interceptor.replace(ptr, nativeCallback);
                console.log("[+] Interceptor.replace applied to " + func);
            } catch (err) {
                console.log("[!] Replace failed for " + func + ", trying attach. Err: " + err.message);
                // Fallback to attach
                Interceptor.attach(ptr, {
                    onEnter: function(args) {
                        console.log("[!] NATIVE BLOCK (Attach): " + func + " called. Sleeping.");
                        Thread.sleep(3600000);
                    }
                });
            }
        } else {
            // For kill, abort, etc.
             Interceptor.attach(ptr, {
                onEnter: function(args) {
                    console.log("[!] NATIVE BLOCK: " + func + " called. Sleeping.");
                    Thread.sleep(3600000);
                }
            });
            console.log("[+] Interceptor.attach applied to " + func);
        }
        
    } catch (e) {
        console.log("[!] Hooking failed for " + func + ": " + e.message);
    }
}

// 1. Hook the Native Exits (libc.so)
hookNative("libc.so", "exit");
hookNative("libc.so", "_exit");
hookNative("libc.so", "kill");
hookNative("libc.so", "abort");


// 2. Java Hooks
if (Java.available) {
    Java.perform(function() {
        console.log("[*] Java Layer Hooks Loading...");

        // File Hiding
        try {
            var File = Java.use("java.io.File");
            var hiddenPaths = [
                "/sbin/su", "/system/bin/su", "/system/xbin/su", "/data/local/xbin/su",
                "/data/local/bin/su", "/system/sd/xbin/su", "/system/bin/failsafe/su",
                "/data/local/su", "/su/bin/su",
                "/sbin/magisk", "/data/adb/magisk", "/data/adb/magisk.img", 
                "/data/adb/magisk.db", "/cache/magisk.log", "/init.magisk.rc",
                "/system/app/Superuser.apk"
            ];

            File.exists.implementation = function() {
                var path = this.getAbsolutePath();
                for (var i = 0; i < hiddenPaths.length; i++) {
                    if (path === hiddenPaths[i] || path.startsWith("/data/adb/modules")) {
                        console.log("[+] Hiding file presence: " + path);
                        return false;
                    }
                }
                return this.exists.call(this);
            };
        } catch(e) { console.log("[!] File hook error: " + e.message); }

        // Command Blocking
        try {
            var Runtime = Java.use("java.lang.Runtime");
            var execOverloads = Runtime.exec.overloads;
            for (var i = 0; i < execOverloads.length; i++) {
                execOverloads[i].implementation = function() {
                    var args = arguments[0];
                    var cmd = Array.isArray(args) ? args.join(" ") : args.toString();
                    if (cmd.indexOf("su") !== -1 || cmd.indexOf("magisk") !== -1) {
                        console.log("[+] Blocking shell command: " + cmd);
                        throw Java.use("java.io.IOException").$new("Permission denied");
                    }
                    return this.exec.apply(this, arguments);
                };
            }
        } catch(e) { console.log("[!] Runtime hook error: " + e.message); }

        // Package Hiding
        try {
            var ApplicationPackageManager = Java.use("android.app.ApplicationPackageManager");
            ApplicationPackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pkg, flags) {
                if (pkg === "com.topjohnwu.magisk") {
                    console.log("[+] Hiding Magisk Package Info");
                    throw Java.use("android.content.pm.PackageManager$NameNotFoundException").$new(pkg);
                }
                return this.getPackageInfo(pkg, flags);
            };
        } catch (e) {}
        
        console.log("[*] Java Hooks Active.");
    });
} else {
    console.log("[!] Java not available.");
}