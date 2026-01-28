
// --- 8 Ball Pool Ultimate Bypass v19 (Toast & Overlay Slayer) ---
// 
// ISSUE: The "Security Threat" message is a TOAST, not a Dialog.
// FIX: Block Toast.show() if the text contains threat keywords.
// Also: Maintain the Freeze Wall because it kept the app alive (it tried to abort/kill but failed).

console.log("[*] Injecting v19 Bypass...");

if (Java.available) {
    Java.perform(function() {
        console.log("[*] Java Hooks Loading...");

        // ============================================================
        // 1. THE TOAST BLOCKER (The Real Fix?)
        // ============================================================
        try {
            var Toast = Java.use("android.widget.Toast");
            
            // Hook makeText to inspect content before creation
            Toast.makeText.overload('android.content.Context', 'java.lang.CharSequence', 'int').implementation = function(ctx, text, duration) {
                var str = text.toString();
                if (str.indexOf("Security") !== -1 || str.indexOf("threat") !== -1 || str.indexOf("Risk") !== -1) {
                    console.log("[+] BLOCKED Security Toast: " + str);
                    // Return a dummy toast with empty text to avoid crashes
                    return this.makeText(ctx, "", duration);
                }
                return this.makeText(ctx, text, duration);
            };

            // Hook show() to catch any we missed
            Toast.show.implementation = function() {
                // We can't easily read the text here on older Android, but if makeText caught it, we are good.
                // If we want to be aggressive:
                // console.log("[*] Toast.show() called"); 
                return this.show();
            };
        } catch (e) {
            console.log("[-] Toast hook failed: " + e.message);
        }

        // ============================================================
        // 2. OVERLAY DETECTION BLOCKER
        // ============================================================
        // Sometimes "Security Threat" comes from detecting overlays (like Frida's UI or others).
        try {
            var View = Java.use("android.view.View");
            // Hook filterTouchesWhenObscured to preventing obscuring checks
            View.setFilterTouchesWhenObscured.implementation = function(b) {
                // console.log("[*] Disabled filterTouchesWhenObscured");
                return this.setFilterTouchesWhenObscured(false);
            };
        } catch(e) {}

        // ============================================================
        // 3. STANDARD LOGIC BYPASSES
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
                // Blindly block sending. We are past the point of being nice.
                // If we block EVERYTHING, the game might not init session, but it wont detect root.
                // Let's try blocking only detection-like sizes? No, text check is better.
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
