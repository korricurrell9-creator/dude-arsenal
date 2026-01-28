
// --- 8 Ball Pool Ultimate Bypass v8 (The "Big Picture" Update) ---
// Based on decompiled source analysis:
// 1. Blocks 'ErrorDialog' which triggers System.exit(0) on dismiss.
// 2. Blocks 'MCApplication.signalFatalError' to prevent the internal flag.
// 3. Blocks 'cocojava' exit methods.
// 4. Retains Native & Java hiding from v7.

console.log("[*] Injecting v8 Bypass...");

// ============================================================================
// PART 1: NATIVE BYPASS (Hooks libc.so)
// ============================================================================
var libc = null;
try {
    libc = Process.getModuleByName("libc.so");
} catch (e) {}

if (libc) {
    function hookNativeFunc(name, onEnterFunc) {
        var ptr = libc.findExportByName(name);
        if (ptr) {
            try {
                Interceptor.attach(ptr, { onEnter: onEnterFunc });
            } catch (e) {
                console.log("[-] Failed to hook " + name);
            }
        }
    }

    // Freeze thread on exit/kill
    var freezeThread = function(args) {
        console.log("[!!!] NATIVE EXIT/ABORT TRIGGERED! Freezing thread.");
        Thread.sleep(3600000); 
    };

    hookNativeFunc("exit", freezeThread);
    hookNativeFunc("_exit", freezeThread);
    hookNativeFunc("abort", freezeThread);
    hookNativeFunc("kill", function(args) {
        if (parseInt(args[0]) === Process.id) {
             console.log("[!!!] NATIVE KILL(self) TRIGGERED! Freezing.");
             Thread.sleep(3600000);
        }
    });

    // File Access Redirection
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
                        // console.log("[!] Native Access Blocked: " + path);
                        pathArg.writeUtf8String("/system/does_not_exist_123");
                        return;
                    }
                }
            }
        } catch (e) {}
    }

    hookNativeFunc("access", function(args) { checkAndDeny(args[0]); });
    hookNativeFunc("open", function(args) { checkAndDeny(args[0]); });
    hookNativeFunc("stat", function(args) { checkAndDeny(args[0]); });
    hookNativeFunc("lstat", function(args) { checkAndDeny(args[0]); });
}

// ============================================================================
// PART 2: JAVA BYPASS (Logic & UI Layer)
// ============================================================================

if (Java.available) {
    Java.perform(function() {
        console.log("[*] Java Hooks Loading...");

        // --- A. Block the Error Dialogs (Source: com.miniclip.utils.ErrorDialog) ---
        // These dialogs call System.exit(0) when dismissed. We prevent them from showing.
        try {
            var ErrorDialog = Java.use("com.miniclip.utils.ErrorDialog");

            ErrorDialog.displayErrorMessage.overload('java.lang.String', 'java.lang.String').implementation = function(title, msg) {
                console.log("[!] BLOCKED ErrorDialog: " + title + " - " + msg);
                return; // Do nothing
            };
            
            ErrorDialog.displayInfoMessage.overload('java.lang.String', 'java.lang.String').implementation = function(title, msg) {
                console.log("[!] BLOCKED InfoDialog: " + title + " - " + msg);
                return;
            };

            console.log("[+] ErrorDialog hooks active.");
        } catch (e) {
            console.log("[-] ErrorDialog hook failed (class might be renamed): " + e.message);
        }

        // --- B. Block Fatal Error Signals (Source: com.miniclip.platform.MCApplication) ---
        try {
            var MCApplication = Java.use("com.miniclip.platform.MCApplication");
            
            // Prevent setting the fatal error flag
            MCApplication.signalFatalError.implementation = function(code) {
                console.log("[!] BLOCKED MCApplication.signalFatalError(" + code + ")");
                return;
            };

            // Force the app to think no error occurred
            MCApplication.hasFatalErrorOccurred.implementation = function() {
                return false;
            };
             console.log("[+] MCApplication hooks active.");
        } catch (e) {
            console.log("[-] MCApplication hook failed: " + e.message);
        }

        // --- C. Block Activity Exits (Source: com.miniclip.nativeJNI.cocojava) ---
        try {
            var CocoJava = Java.use("com.miniclip.nativeJNI.cocojava");
            
            CocoJava.exitApplication.implementation = function() {
                console.log("[!] BLOCKED cocojava.exitApplication()");
                return;
            };

            CocoJava.cleanAndroidData.implementation = function() {
                 console.log("[!] BLOCKED cocojava.cleanAndroidData()");
                 return;
            };
            console.log("[+] cocojava hooks active.");
        } catch (e) {
             console.log("[-] cocojava hook failed: " + e.message);
        }

        // --- D. Standard Root Hiding (Files & Packages) ---
        try {
            var File = Java.use("java.io.File");
            var hiddenPathsJava = [
                "/sbin/su", "/system/bin/su", "/system/xbin/su", "/data/local/xbin/su",
                "/data/local/bin/su", "/system/sd/xbin/su", "/system/bin/failsafe/su",
                "/data/local/su", "/su/bin/su",
                "/sbin/magisk", "/data/adb/magisk", "/data/adb/modules",
                "/system/app/Superuser.apk", "com.topjohnwu.magisk"
            ];

            File.exists.implementation = function() {
                var path = this.getAbsolutePath();
                for (var i = 0; i < hiddenPathsJava.length; i++) {
                    if (path.indexOf(hiddenPathsJava[i]) !== -1) {
                        return false;
                    }
                }
                return this.exists.call(this);
            };
        } catch(e) {}

        try {
            var AppPM = Java.use("android.app.ApplicationPackageManager");
            AppPM.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pkg, flags) {
                if (pkg === "com.topjohnwu.magisk") {
                    throw Java.use("android.content.pm.PackageManager$NameNotFoundException").$new(pkg);
                }
                return this.getPackageInfo(pkg, flags);
            };
        } catch (e) {}
        
        // --- E. Generic Exit Blocking ---
        try {
            var System = Java.use("java.lang.System");
            System.exit.implementation = function(code) {
                console.log("[!] BLOCKED System.exit(" + code + ")");
            };
        } catch(e) {}

        console.log("[*] v8 Bypass Logic Active.");
    });
}
