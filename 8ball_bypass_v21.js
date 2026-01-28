
// --- 8 Ball Pool Ultimate Bypass v21 (Package Visibility Stealth) ---
// 
// STATUS: v20 successfully blocked the Toast and the Kill. The game is playable.
// GOAL: Prevent the "Magisk Detected" event from happening at all.
// NEW FEATURE: Hides Magisk/Root apps from 'getInstalledPackages' and 'getInstalledApplications'.
//              This fixes the vector where apps scan your entire app list.

console.log("[*] Injecting v21 Bypass...");

if (Java.available) {
    Java.perform(function() {
        console.log("[*] Java Hooks Loading...");

        // ============================================================
        // 1. PACKAGE LIST HIDING (The Missing Link)
        // ============================================================
        try {
            var PM = Java.use("android.app.ApplicationPackageManager");
            var hiddenApps = ["com.topjohnwu.magisk", "eu.chainfire.supersu", "com.noshufou.android.su"];

            // Hook getInstalledApplications
            PM.getInstalledApplications.overload('int').implementation = function(flags) {
                var list = this.getInstalledApplications(flags);
                var iter = list.iterator();
                while (iter.hasNext()) {
                    var appInfo = iter.next();
                    var pkg = appInfo.packageName.value; // Read field
                    for (var i = 0; i < hiddenApps.length; i++) {
                        if (pkg.indexOf(hiddenApps[i]) !== -1) {
                            console.log("[+] Hiding App from List: " + pkg);
                            iter.remove();
                            break;
                        }
                    }
                }
                return list;
            };

            // Hook getInstalledPackages
            PM.getInstalledPackages.overload('int').implementation = function(flags) {
                var list = this.getInstalledPackages(flags);
                var iter = list.iterator();
                while (iter.hasNext()) {
                    var pkgInfo = iter.next();
                    var pkg = pkgInfo.packageName.value;
                    for (var i = 0; i < hiddenApps.length; i++) {
                        if (pkg.indexOf(hiddenApps[i]) !== -1) {
                            console.log("[+] Hiding Pkg from List: " + pkg);
                            iter.remove();
                            break;
                        }
                    }
                }
                return list;
            };
            console.log("[+] Package List Hiding Active.");

        } catch (e) {
            console.log("[-] Package hook failed: " + e.message);
        }

        // ============================================================
        // 2. TOAST BLOCKER (v20 Logic)
        // ============================================================
        try {
            var Toast = Java.use("android.widget.Toast");
            var JavaString = Java.use("java.lang.String");
            Toast.makeText.overload('android.content.Context', 'java.lang.CharSequence', 'int').implementation = function(ctx, text, duration) {
                var str = text.toString();
                if (str.indexOf("Security") !== -1 || str.indexOf("threat") !== -1 || str.indexOf("Risk") !== -1 || str.indexOf("REF:") !== -1) {
                    console.log("[+] BLOCKED Security Toast: " + str);
                    return this.makeText(ctx, JavaString.$new(""), duration);
                }
                return this.makeText(ctx, text, duration);
            };
        } catch (e) {}

        // ============================================================
        // 3. STANDARD BYPASSES
        // ============================================================
        try { Java.use("com.miniclip.platform.MCApplication").isDeviceRooted.implementation = function() { return false; }; } catch(e) {}
        try { Java.use("com.miniclip.eightballpool.rtm.ResponseTimeMonitorRunnable").run.implementation = function() { console.log("[+] Watchdog Disabled"); }; } catch(e) {}
        try {
            var Events = Java.use("com.miniclip.events.EventsReceiver");
            Events.sendBlobsNative.implementation = function(b1, b2) {
                var s1 = b1 ? Java.use("java.lang.String").$new(b1).toString() : "";
                if (s1.indexOf("Magisk")!==-1 || s1.indexOf("Root")!==-1) return;
                return this.sendBlobsNative(b1, b2);
            };
        } catch(e) {}

        console.log("[*] Java Hooks Active.");
    });
}

// ============================================================================
// PART 2: NATIVE LAYER (Freeze Wall)
// ============================================================================
var libc = null;
try { libc = Process.getModuleByName("libc.so"); } catch (e) {}

if (libc) {
    function freeze(name) {
        return new NativeCallback(function() {
            console.log("[!!!] BLOCKED " + name + ". Freezing thread.");
            while(true) Thread.sleep(1000); 
        }, 'void', ['int']);
    }
    var funcs = ["exit", "_exit", "abort"];
    funcs.forEach(function(f) {
        var p = libc.findExportByName(f);
        if(p) Interceptor.replace(p, freeze(f));
    });
    var killP = libc.findExportByName("kill");
    if(killP) {
        Interceptor.replace(killP, new NativeCallback(function(p, s) {
            if (p === Process.id) {
                console.log("[!!!] BLOCKED kill(self). Freezing.");
                while(true) Thread.sleep(1000);
            }
            return 0;
        }, 'int', ['int', 'int']));
    }
}
