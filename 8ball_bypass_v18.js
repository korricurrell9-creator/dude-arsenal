
// --- 8 Ball Pool Ultimate Bypass v18 (Deep Detection & Activity Trace) ---
// 
// 1. STOPS THE SUICIDE: Freezes the thread on exit/kill/abort so the app stays alive.
// 2. TRACES REPORTING: Hooks sendBlobsNative to see exactly what security events are fired.
// 3. ACTIVITY TRACER: Hooks Activity.startActivity to see if a "SecurityWarningActivity" is launched.
// 4. PROPERTY HIDING: Hides root-related system properties.
// 5. BIDMACHINE BYPASS: Adds hook for io.bidmachine.DeviceInfo.

console.log("[*] Injecting v18 Bypass...");

if (Java.available) {
    Java.perform(function() {
        console.log("[*] Java Hooks Loading...");

        // --- 1. Intercept Security Event Reporting ---
        try {
            var EventsReceiver = Java.use("com.miniclip.events.EventsReceiver");
            EventsReceiver.sendBlobsNative.implementation = function(b1, b2) {
                var s1 = b1 ? Java.use("java.lang.String").$new(b1).toString() : "";
                var s2 = b2 ? Java.use("java.lang.String").$new(b2).toString() : "";
                console.log("[!] Native Report Attempt: " + s1 + " | " + s2);
                
                if (s1.indexOf("Magisk") !== -1 || s1.indexOf("Root") !== -1 || s1.indexOf("Frida") !== -1) {
                    console.log("[+] FIREWALL: Blocked detection report.");
                    return; 
                }
                return this.sendBlobsNative(b1, b2);
            };
        } catch (e) {}

        // --- 2. Activity Start Tracer ---
        try {
            var Activity = Java.use("android.app.Activity");
            Activity.startActivity.overload('android.content.Intent').implementation = function(intent) {
                var action = intent.getAction();
                var component = intent.getComponent();
                console.log("[*] startActivity: " + (component ? component.getClassName() : action));
                return this.startActivity(intent);
            };
        } catch (e) {}

        // --- 3. BidMachine Bypass ---
        try {
            var BidDevice = Java.use("io.bidmachine.DeviceInfo");
            BidDevice.isDeviceRooted.implementation = function() {
                console.log("[+] Bypassing BidMachine root check.");
                return false;
            };
        } catch (e) {}

        // --- 4. MCApplication & RTM (Keep) ---
        try {
            Java.use("com.miniclip.platform.MCApplication").isDeviceRooted.implementation = function() { return false; };
            Java.use("com.miniclip.eightballpool.rtm.ResponseTimeMonitorRunnable").run.implementation = function() { return; };
        } catch (e) {}

        // --- 5. Global Dialog & Toast Blocker ---
        try {
            var Toast = Java.use("android.widget.Toast");
            Toast.show.implementation = function() {
                console.log("[!] Suppressed a Toast message.");
                // return; // Uncomment to block all toasts
                return this.show();
            };
        } catch (e) {}

        console.log("[*] Java Hooks Active.");
    });
}

// ============================================================================
// PART 2: NATIVE LAYER (The "Brick Wall")
// ============================================================================
var libc = null;
try { libc = Process.getModuleByName("libc.so"); } catch (e) {}

if (libc) {
    function blockAndFreeze(name, ptr) {
        Interceptor.replace(ptr, new NativeCallback(function() {
            console.log("[!!!] CRITICAL: App tried to call " + name + "(). FREEZING THREAD.");
            while(true) { Thread.sleep(1000); }
        }, 'void', ['int'])); // Signature for exit/kill is close enough
    }

    // 1. Hook and Freeze Exits
    var exits = ["exit", "_exit", "abort"];
    exits.forEach(function(e) {
        var p = libc.findExportByName(e);
        if (p) blockAndFreeze(e, p);
    });

    // 2. Block Kill
    var k = libc.findExportByName("kill");
    if (k) {
        Interceptor.replace(k, new NativeCallback(function(pid, sig) {
            if (pid === Process.id) {
                console.log("[!!!] BLOCKED kill(self). FREEZING.");
                while(true) { Thread.sleep(1000); }
            }
            return 0;
        }, 'int', ['int', 'int']));
    }

    // 3. System Property Hiding
    var sysPropGet = libc.findExportByName("__system_property_get");
    if (sysPropGet) {
        Interceptor.attach(sysPropGet, {
            onEnter: function(args) {
                this.prop = args[0].readCString();
            },
            onLeave: function(retval) {
                if (this.prop.indexOf("ro.build.tags") !== -1 || this.prop.indexOf("test-keys") !== -1) {
                    console.log("[+] Hiding prop: " + this.prop);
                    args[1].writeUtf8String("release-keys");
                }
            }
        });
    }

    // 4. Native File Hiding (The usual suspects)
    var rootFiles = ["su", "magisk", "busybox", "daemonsu"];
    var filesHooks = ["open", "access", "stat", "lstat"];
    filesHooks.forEach(function(name) {
        var p = libc.findExportByName(name);
        if (p) {
            Interceptor.attach(p, {
                onEnter: function(args) {
                    try {
                        var path = args[0].readCString();
                        for (var i=0; i<rootFiles.length; i++) {
                            if (path.indexOf(rootFiles[i]) !== -1) {
                                args[0].writeUtf8String("/system/does_not_exist");
                                return;
                            }
                        }
                    } catch(e){}
                }
            });
        }
    });
}
