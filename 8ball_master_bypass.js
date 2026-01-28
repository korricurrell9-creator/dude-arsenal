/*
 * DUDE's Ultimate All-in-One Bypass, now with added Integrity Check bypass.
 *
 * This script combines multiple bypass techniques to counter common anti-debugging
 * and anti-root measures. It addresses:
 * 1. Root detection via file checks and command execution.
 * 2. Frida detection by hooking native memory search functions (strstr) (DISABLED).
 * 3. Timeout-based crashes from anti-debugging thread suspension (Thread.suspend).
 * 4. Silent exits via System.exit().
 * 5. UI integrity checks.
 */

console.log("[*] DUDE's Ultimate Bypass v3 (Master Edition) loaded.");

// Bypass Root Detection
function bypassRootDetection() {
    try {
        const File = Java.use('java.io.File');
        const Runtime = Java.use('java.lang.Runtime');

        const rootPaths = [
            "/system/app/Superuser.apk",
            "/sbin/su",
            "/system/bin/su",
            "/system/xbin/su",
            "/data/local/xbin/su",
            "/data/local/bin/su",
            "/system/sd/xbin/su",
            "/system/bin/failsafe/su",
            "/data/local/su",
            "/su/bin/su"
        ];

        // Hook File.exists()
        File.exists.implementation = function() {
            const path = this.getAbsolutePath();
            if (rootPaths.indexOf(path) > -1) {
                console.log(`[+] ROOT BYPASS: Denying existence of file: ${path}`);
                return false;
            }
            return this.exists.call(this);
        };

        // Hook Runtime.exec() overloads
        const execOverloads = Runtime.getRuntime().exec.overloads;
        execOverloads.forEach(overload => {
            overload.implementation = function(...args) {
                let cmd = args[0];
                if (Array.isArray(cmd)) {
                    cmd = cmd.join(' ');
                }
                if (cmd && cmd.includes('su')) {
                    console.log(`[+] ROOT BYPASS: Blocking command: ${cmd}`);
                    throw Java.use("java.io.IOException").$new("Permission denied");
                }
                return overload.apply(this, args);
            };
        });

        console.log("[+] Root detection bypasses are live.");

    } catch (e) {
        console.error(`[!] Root bypass failed: ${e.message}`);
    }
}

// Hide Frida's presence (DISABLED)
function hideFrida() {
    try {
        const strstr = Module.findExportByName(null, "strstr");
        if (strstr) {
            Interceptor.attach(strstr, {
                onEnter: function(args) {
                    this.haystack = args[0].readCString();
                    this.needle = args[1].readCString();
                    if (this.needle && this.needle.toLowerCase().includes("frida")) {
                        console.log(`[+] FRIDA HIDE: Blocking strstr search for '${this.needle}'`);
                        this.needle = Memory.alloc(1);
                    }
                }
            });
            console.log("[+] Frida hiding (strstr) is active.");
        } else {
            console.warn("[!] Could not find 'strstr' to hook for Frida hiding.");
        }
    } catch (e) {
        console.error(`[!] Frida hiding failed: ${e.message}`);
    }
}


// Bypass Thread suspension which causes crashes
function bypassSuspend() {
    try {
        const Thread = Java.use('java.lang.Thread');
        Thread.suspend.implementation = function() {
            console.log("[+] SUSPEND BYPASS: Intercepted call to Thread.suspend(). Ignoring.");
            return;
        };
        console.log("[+] Suspend bypass is active.");
    } catch (e) {
        console.error(`[!] Suspend bypass failed: ${e.message}`);
    }
}

// Prevent the app from silently closing itself
function bypassSystemExit() {
    try {
        const System = Java.use('java.lang.System');
        System.exit.implementation = function(status) {
            console.log(`[+] EXIT BYPASS: Intercepted System.exit(${status}) call.`);
            const stack = Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new());
            console.log(stack);
            console.log("[+] Preventing exit.");
            return;
        };
        console.log("[+] System.exit bypass is active.");
    } catch (e) {
        console.error(`[!] System.exit bypass failed: ${e.message}`);
    }
}

// Bypass the UI integrity check
function bypassIntegrityCheck() {
    try {
        var IntegrityChecker = Java.use('a.a.a.a.a.j');
        IntegrityChecker.c.implementation = function(str) {
            console.log("[+] Intercepted call to integrity checker a.a.a.a.a.j.c(). Returning empty string.");
            return "";
        };
        console.log("[+] Integrity check bypass is active.");
    } catch (e) {
        console.error(`[!] Failed to deploy integrity check bypass: ${e.message}`);
    }
}


// --- Main Execution ---
if (Java.available) {
    Java.perform(function() {
        console.log("[*] In Java.perform(). Deploying all bypasses...");

        try {
            console.log("[*] Deploying Root Detection bypass...");
            bypassRootDetection();
        } catch (e) {
            console.error(`[!!!] CRITICAL FAILURE in bypassRootDetection: ${e.message}`);
        }

        /* try {
            console.log("[*] Deploying Frida Hiding bypass...");
            hideFrida();
        } catch (e) {
            console.error(`[!!!] CRITICAL FAILURE in hideFrida: ${e.message}`);
        } */

        try {
            console.log("[*] Deploying Suspend bypass...");
            bypassSuspend();
        } catch (e) {
            console.error(`[!!!] CRITICAL FAILURE in bypassSuspend: ${e.message}`);
        }

        try {
            console.log("[*] Deploying System Exit bypass...");
            bypassSystemExit();
        } catch (e) {
            console.error(`[!!!] CRITICAL FAILURE in bypassSystemExit: ${e.message}`);
        }
        
        try {
            console.log("[*] Deploying Integrity Check bypass...");
            bypassIntegrityCheck();
        } catch (e) {
            console.error(`[!!!] CRITICAL FAILURE in bypassIntegrityCheck: ${e.message}`);
        }

        console.log("[*] All bypass modules deployed. Check for critical failures.");
    });
} else {
    console.error("[!] Java VM not available. Cannot apply hooks.");
}
