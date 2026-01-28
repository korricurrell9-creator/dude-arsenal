
// --- 8 Ball Pool Ultimate Bypass v20 (Fixing the Toast Crash) ---
// 
// ISSUE: The Toast blocker crashed because 'makeText' requires a CharSequence, not a string primitive for the text argument in our override.
// FIX: Cast the empty string to a Java String object before passing it to the original makeText.
// Also: Maintaining the Freeze Wall.

console.log("[*] Injecting v20 Bypass...");

if (Java.available) {
    Java.perform(function() {
        console.log("[*] Java Hooks Loading...");

        // ============================================================
        // 1. THE TOAST BLOCKER (Corrected)
        // ============================================================
        try {
            var Toast = Java.use("android.widget.Toast");
            var JavaString = Java.use("java.lang.String");
            
            // Hook makeText to inspect content before creation
            Toast.makeText.overload('android.content.Context', 'java.lang.CharSequence', 'int').implementation = function(ctx, text, duration) {
                var str = text.toString();
                if (str.indexOf("Security") !== -1 || str.indexOf("threat") !== -1 || str.indexOf("Risk") !== -1 || str.indexOf("REF:") !== -1) {
                    console.log("[+] BLOCKED Security Toast: " + str);
                    
                    // Create a proper Java String for the empty text
                    var empty = JavaString.$new(""); 
                    // Return a dummy toast with empty text
                    return this.makeText(ctx, empty, duration);
                }
                return this.makeText(ctx, text, duration);
            };

            // Hook show() to catch any we missed
            Toast.show.implementation = function() {
                return this.show();
            };
        } catch (e) {
            console.log("[-] Toast hook failed: " + e.message);
        }

        // ============================================================
        // 2. STANDARD LOGIC BYPASSES
        // ============================================================
        try {
            var MCApp = Java.use("com.miniclip.platform.MCApplication");
            MCApp.isDeviceRooted.implementation = function() { return false; };
        } catch(e) {}

        try {
            var RTM = Java.use("com.miniclip.eightballpool.rtm.ResponseTimeMonitorRunnable");
            RTM.run.implementation = function() { console.log("[+] Watchdog Disabled"); };
        } catch(e) {}

        // Block reporting
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
// PART 2: NATIVE LAYER (The Brick Wall - Optimized)
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

    // Replace exit/abort/kill with the infinite sleep loop
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
