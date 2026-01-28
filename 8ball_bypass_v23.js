
// --- 8 Ball Pool Ultimate Bypass v23 (Property Cloak & Advanced Hide) ---
// 
// ISSUE: Some apps check System Properties via __system_property_get or getprop.
//        If they see "ro.debuggable=1" or "ro.build.selinux=0", they exit.
//
// FIX: Hook __system_property_get to return "safe" values for sensitive keys.
//
// ADDITION: Improved Native Hide for Frida artifacts in memory.

console.log("[*] Injecting v23 Bypass (Property Cloak Edition)...");

// ============================================================================
// PART 1: JAVA LAYER (Prop Hiding & SSL)
// ============================================================================
if (Java.available) {
    Java.perform(function() {
        console.log("[*] Java Hooks Loading...");

        // 1. System Properties Hook
        try {
            var SystemProperties = Java.use("android.os.SystemProperties");
            SystemProperties.get.overload('java.lang.String').implementation = function(key) {
                var val = this.get(key);
                if (key === "ro.debuggable") return "0";
                if (key === "ro.build.selinux") return "1";
                if (key === "ro.secure") return "1";
                return val;
            };
        } catch (e) {}

        // 2. SSL Pinning Bypass (Generic)
        try {
            var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");
            TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
                return untrustedChain;
            };
            console.log("[+] SSL Pinning Neutralized.");
        } catch (e) {}

        console.log("[*] Java Hooks Active.");
    });
}

// ============================================================================
// PART 2: NATIVE LAYER (Anti-Detection & Prop Spoofing)
// ============================================================================
var libc = null;
try { libc = Process.getModuleByName("libc.so"); } catch (e) {}

if (libc) {
    // 1. Property Spoofing (__system_property_get)
    var propGetPtr = libc.findExportByName("__system_property_get");
    if (propGetPtr) {
        Interceptor.attach(propGetPtr, {
            onEnter: function(args) {
                this.propName = args[0].readCString();
            },
            onLeave: function(retval) {
                if (this.propName) {
                    var safeVal = null;
                    if (this.propName === "ro.debuggable") safeVal = "0";
                    if (this.propName === "ro.build.selinux") safeVal = "1";
                    if (this.propName === "ro.secure") safeVal = "1";
                    
                    if (safeVal) {
                        console.log("[+] Spoofing Prop: " + this.propName + " -> " + safeVal);
                        this.context.r1.writeUtf8String(safeVal); // r1 is the buffer (args[1])
                    }
                }
            }
        });
    }

    // 2. FILE & MAPS HIDING (Carry over from v22)
    var rootPaths = [
        "/sbin/su", "/system/bin/su", "/system/xbin/su", "magisk", 
        "frida", "gum-js-loop", "gdbus", "/proc/net/unix"
    ];

    var openPtr = libc.findExportByName("open");
    if (openPtr) {
        Interceptor.attach(openPtr, {
            onEnter: function(args) {
                var path = args[0].readCString();
                if (path) {
                    for (var i = 0; i < rootPaths.length; i++) {
                        if (path.indexOf(rootPaths[i]) !== -1) {
                            console.log("[+] Native Hide: " + path);
                            args[0].writeUtf8String("/dev/null");
                            return;
                        }
                    }
                }
            }
        });
    }

    // 3. FAKE SUICIDE (Black Screen Fix)
    var killPtr = libc.findExportByName("kill");
    if (killPtr) {
        Interceptor.replace(killPtr, new NativeCallback(function(pid, sig) {
            console.log("[!] BLOCKED kill(" + pid + ", " + sig + ")");
            return 0;
        }, 'int', ['int', 'int']));
    }
}
