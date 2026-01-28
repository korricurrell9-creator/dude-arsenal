
// --- 8 Ball Pool Ultimate Bypass v16 (Global Dialog Blocker & Safe Kill) ---
// 
// 1. GLOBAL DIALOG BLOCKER: Hooks android.app.AlertDialog to stop ANY popup containing "Security", "Risk", etc.
// 2. SAFE KILL: Intercepts kill() and returns 0 (Success) immediately without crashing the script.
// 3. SHELL BLOCKER: Hooks native system() and popen() to stop shell commands.
// 4. JAVA FIREWALL: Keeps previous protections.

console.log("[*] Injecting v16 Bypass...");

// ============================================================================
// PART 1: JAVA UI & LOGIC
// ============================================================================
if (Java.available) {
    Java.perform(function() {
        console.log("[*] Java Hooks Loading...");

        // 1. GLOBAL DIALOG BLOCKER (The Nuclear Option for Popups)
        try {
            var AlertDialogBuilder = Java.use("android.app.AlertDialog$Builder");
            
            // Hook setTitle
            AlertDialogBuilder.setTitle.overload('java.lang.CharSequence').implementation = function(title) {
                var str = title.toString();
                if (str.indexOf("Security") !== -1 || str.indexOf("Magisk") !== -1 || str.indexOf("Risk") !== -1) {
                    console.log("[!] BLOCKED AlertDialog Title: " + str);
                    // Replace with harmless text or empty to make it invisible/confusing? 
                    // Better to prevent showing. We'll tag this builder.
                    this._blocked = true; 
                    return this.setTitle(""); 
                }
                return this.setTitle(title);
            };

            // Hook setMessage
            AlertDialogBuilder.setMessage.overload('java.lang.CharSequence').implementation = function(msg) {
                var str = msg.toString();
                if (str.indexOf("Risk") !== -1 || str.indexOf("threat") !== -1 || str.indexOf("detected") !== -1) {
                    console.log("[!] BLOCKED AlertDialog Message: " + str);
                    this._blocked = true;
                    return this.setMessage("");
                }
                return this.setMessage(msg);
            };

            // Hook show() - The final gate
            AlertDialogBuilder.show.implementation = function() {
                if (this._blocked) {
                    console.log("[!] Suppressed blocked AlertDialog.show()");
                    return null; // Return null (might cause NPE in app if not handled, but stops dialog)
                }
                return this.show();
            };

        } catch (e) {
            console.log("[-] AlertDialog hook failed: " + e.message);
        }

        // 2. MCApplication Root Check
        try {
            var MCApp = Java.use("com.miniclip.platform.MCApplication");
            MCApp.isDeviceRooted.implementation = function() { return false; };
        } catch (e) {}

        // 3. EventsReceiver Firewall (Drop Malicious Intents)
        try {
            var EventsReceiver = Java.use("com.miniclip.events.EventsReceiver");
            var blockedActions = ["Magisk", "Root", "Frida", "Hook", "Overlay", "UnknownSources", "Bootloader", "ADB"];
            
            EventsReceiver.onReceive.implementation = function(context, intent) {
                if (intent && intent.getAction()) {
                    var action = intent.getAction();
                    for (var i = 0; i < blockedActions.length; i++) {
                        if (action.indexOf(blockedActions[i]) !== -1) {
                            console.log("[+] FIREWALL: Dropped Intent -> " + action);
                            return;
                        }
                    }
                }
                return this.onReceive(context, intent);
            };
        } catch (e) {}

        // 4. RTM Watchdog Disable
        try {
            var RTM = Java.use("com.miniclip.eightballpool.rtm.ResponseTimeMonitorRunnable");
            RTM.run.implementation = function() { console.log("[+] Watchdog Disabled"); return; };
        } catch(e) {}

        console.log("[*] Java Hooks Active.");
    });
}

// ============================================================================
// PART 2: NATIVE LAYER
// ============================================================================
var libc = null;
try { libc = Process.getModuleByName("libc.so"); } catch (e) {}

if (libc) {
    // 1. Safe Kill Hook (No Backtrace to prevent crash)
    var killPtr = libc.findExportByName("kill");
    if (killPtr) {
        Interceptor.replace(killPtr, new NativeCallback(function(pid, sig) {
            if (pid === Process.id) {
                console.log("[!!!] NATIVE KILL(self) DETECTED! Faking success.");
                // Return 0 means "Success, I sent the signal". 
                // But we DON'T send it. The app thinks it killed itself but it didn't.
                return 0; 
            }
            return 0; // Block all kills just to be safe
        }, 'int', ['int', 'int']));
    }

    // 2. Block Shell Commands (system/popen)
    var systemPtr = libc.findExportByName("system");
    if (systemPtr) {
        Interceptor.replace(systemPtr, new NativeCallback(function(cmd) {
            var cmdStr = cmd.readCString();
            if (cmdStr.indexOf("su") !== -1 || cmdStr.indexOf("magisk") !== -1) {
                console.log("[!] BLOCKED system(): " + cmdStr);
                return -1; // Fail command
            }
            return 0; // Fake success for harmless commands? Or real call?
            // Safer to return failure for detections
        }, 'int', ['pointer']));
    }

    // 3. File Hiding (Standard)
    var rootPaths = ["/sbin/su", "/system/bin/su", "/system/xbin/su", "magisk", "com.topjohnwu.magisk"];
    var hookExports = ["open", "access", "stat", "lstat", "fopen", "openat", "faccessat"];
    
    hookExports.forEach(function(name) {
        var ptr = libc.findExportByName(name);
        if (ptr) {
            Interceptor.attach(ptr, {
                onEnter: function(args) {
                    var pathArg = (name.indexOf("at") !== -1) ? args[1] : args[0];
                    try {
                        var path = pathArg.readCString();
                        if (path) {
                            for (var i = 0; i < rootPaths.length; i++) {
                                if (path.indexOf(rootPaths[i]) !== -1) {
                                    pathArg.writeUtf8String("/system/bin/does_not_exist_123");
                                    return;
                                }
                            }
                        }
                    } catch(e){}
                }
            });
        }
    });
}
