
// --- 8 Ball Pool Ultimate Bypass v22 (Black Screen Fix & Maps Guard) ---
// 
// ISSUE: v21 caused a Black Screen. This happens because we "Froze" the thread when
//        kill/exit was called. If the security check runs on the Main UI Thread,
//        freezing it stops the screen from drawing.
//
// FIX: Instead of freezing, we will "Fake Success". We return 0 immediately.
//      The app will think "Okay, I killed the process", but we continue running.
//
// ADDITION: Hiding "/proc/self/maps" and "/proc/self/status" which are used
//           to detect Frida and Debuggers natively.

console.log("[*] Injecting v22 Bypass...");

// ============================================================================
// PART 1: JAVA LAYER (Package Hiding & Toast Block)
// ============================================================================
if (Java.available) {
    Java.perform(function() {
        console.log("[*] Java Hooks Loading...");

        // 1. Package List Hiding (Prevents scanning for Magisk app)
        try {
            var PM = Java.use("android.app.ApplicationPackageManager");
            var hiddenApps = ["com.topjohnwu.magisk", "eu.chainfire.supersu", "com.noshufou.android.su", "me.weishu.kernelsu"];

            var filterList = function(list) {
                var iter = list.iterator();
                while (iter.hasNext()) {
                    var item = iter.next();
                    var pkg = item.packageName.value;
                    for (var i = 0; i < hiddenApps.length; i++) {
                        if (pkg.indexOf(hiddenApps[i]) !== -1) {
                            console.log("[+] Hiding Package: " + pkg);
                            iter.remove();
                            break;
                        }
                    }
                }
                return list;
            };

            PM.getInstalledApplications.overload('int').implementation = function(flags) {
                return filterList(this.getInstalledApplications(flags));
            };
            PM.getInstalledPackages.overload('int').implementation = function(flags) {
                return filterList(this.getInstalledPackages(flags));
            };
        } catch (e) {}

        // 2. Toast Blocker
        try {
            var Toast = Java.use("android.widget.Toast");
            var JavaString = Java.use("java.lang.String");
            Toast.makeText.overload('android.content.Context', 'java.lang.CharSequence', 'int').implementation = function(ctx, text, duration) {
                var str = text.toString();
                if (str.indexOf("Security")!==-1 || str.indexOf("Risk")!==-1 || str.indexOf("REF:")!==-1) {
                    console.log("[+] BLOCKED Security Toast: " + str);
                    return this.makeText(ctx, JavaString.$new(""), duration);
                }
                return this.makeText(ctx, text, duration);
            };
        } catch (e) {}

        // 3. RTM Disable
        try { Java.use("com.miniclip.eightballpool.rtm.ResponseTimeMonitorRunnable").run.implementation = function() { console.log("[+] Watchdog Disabled"); }; } catch(e) {}

        console.log("[*] Java Hooks Active.");
    });
}

// ============================================================================
// PART 2: NATIVE LAYER (Anti-Detection & Fake Suicide)
// ============================================================================
var libc = null;
try { libc = Process.getModuleByName("libc.so"); } catch (e) {}

if (libc) {
    // 1. FILE & MAPS HIDING
    var rootPaths = [
        "/sbin/su", "/system/bin/su", "/system/xbin/su", "magisk", 
        "com.topjohnwu.magisk", "frida", "gum-js-loop", "gdbus"
    ];

    function checkPath(args) {
        try {
            var path = args[0].readCString();
            if (path) {
                // Hide Root Files
                for (var i = 0; i < rootPaths.length; i++) {
                    if (path.indexOf(rootPaths[i]) !== -1) {
                        console.log("[+] Native Hide: " + path);
                        args[0].writeUtf8String("/system/bin/does_not_exist");
                        return;
                    }
                }
                // Hide Debug/Anti-Tamper Checks
                if (path.indexOf("/proc/self/maps") !== -1 || path.indexOf("/proc/self/status") !== -1) {
                    console.log("[+] Native Monitor Blocked: " + path);
                    // Redirect to a harmless file (like /proc/self/cmdline which is just the app name)
                    // Or just fail the open
                    args[0].writeUtf8String("/dev/null"); 
                    return;
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

    // 2. FAKE SUICIDE (The Black Screen Fix)
    // Instead of sleeping forever (which hangs the UI thread), we return 0.
    // The app calls kill(), expects us to die. We return 0 ("Signal sent").
    // The app proceeds. Ideally it doesn't check if we are actually dead.
    
    var killPtr = libc.findExportByName("kill");
    if (killPtr) {
        Interceptor.replace(killPtr, new NativeCallback(function(pid, sig) {
            if (pid === Process.id) {
                console.log("[!!!] BLOCKED kill(self). Returning success to fool app.");
                return 0; 
            }
            return 0;
        }, 'int', ['int', 'int']));
    }

    var exitPtr = libc.findExportByName("exit");
    if (exitPtr) {
        Interceptor.replace(exitPtr, new NativeCallback(function(code) {
            console.log("[!!!] BLOCKED exit(" + code + "). Ignoring.");
            // If we return, the app continues code execution flow.
            // If the app relies on exit() never returning, it might crash.
            // But crashing is better than freezing the UI if we are lucky.
            // Let's try returning.
            return;
        }, 'void', ['int']));
    }
}
