
// --- 8 Ball Pool Ultimate Bypass v17 (The "Exit" Hole Patch) ---
// 
// ISSUE: App still terminates after "Faking success" on kill().
// REASON: The app calls exit(0) or abort() immediately after kill() fails (or succeeds).
//
// FIX:
// 1. Hook exit() and _exit() with NativeCallback (replace) to return 0 and do nothing.
// 2. Hook abort() to freeze instead of crash.
// 3. Keep kill() blocking.
// 4. Keep Dialog Blocker & Watchdog Disable.

console.log("[*] Injecting v17 Bypass...");

// ============================================================================
// PART 1: NATIVE BYPASS (Plug the Holes)
// ============================================================================
var libc = null;
try { libc = Process.getModuleByName("libc.so"); } catch (e) {}

if (libc) {
    // 1. Block exit(int) - The standard C exit
    var exitPtr = libc.findExportByName("exit");
    if (exitPtr) {
        Interceptor.replace(exitPtr, new NativeCallback(function(code) {
            console.log("[!!!] BLOCKED exit(" + code + ") - App tried to close.");
            // Do NOT call original. Just return.
            // But exit is void. So we just finish. 
            // We might need to sleep to prevent the caller from continuing into undefined behavior?
            // Usually exit() doesn't return. If we return, the app continues execution.
            // Let's sleep to simulate a hang if it's a security exit.
            if (code !== 0) {
                 // Non-zero exit is definitely bad. Sleep forever.
                 Thread.sleep(3600000);
            }
            // If code is 0, it might be normal... but for this app, 0 is often used in security exits too.
            // Let's try sleeping for all.
            // Thread.sleep(3600000); 
            
            // Correction: If we sleep, we freeze. If we return, the app might crash if it expects exit to not return.
            // Let's try returning first. If it crashes, we switch to sleep.
            return; 
        }, 'void', ['int']));
    }

    // 2. Block _exit(int) - The syscall wrapper
    var _exitPtr = libc.findExportByName("_exit");
    if (_exitPtr) {
        Interceptor.replace(_exitPtr, new NativeCallback(function(code) {
            console.log("[!!!] BLOCKED _exit(" + code + ")");
            return; 
        }, 'void', ['int']));
    }

    // 3. Block abort() - Used by stack smash protection / hardening
    var abortPtr = libc.findExportByName("abort");
    if (abortPtr) {
        Interceptor.replace(abortPtr, new NativeCallback(function() {
            console.log("[!!!] BLOCKED abort()");
            // Abort definitely shouldn't return.
            Thread.sleep(3600000); 
        }, 'void', []));
    }

    // 4. Block kill(pid, sig)
    var killPtr = libc.findExportByName("kill");
    if (killPtr) {
        Interceptor.replace(killPtr, new NativeCallback(function(pid, sig) {
            if (pid === Process.id) {
                console.log("[!!!] BLOCKED kill(self)");
                return 0; // Success
            }
            // Allow killing other things? Maybe not.
            return 0;
        }, 'int', ['int', 'int']));
    }
}

// ============================================================================
// PART 2: JAVA BYPASS (Keep v16 Logic)
// ============================================================================
if (Java.available) {
    Java.perform(function() {
        console.log("[*] Java Hooks Active.");

        // Dialog Blocker
        try {
            var Builder = Java.use("android.app.AlertDialog$Builder");
            Builder.setTitle.overload('java.lang.CharSequence').implementation = function(t) {
                if (t.toString().indexOf("Security")!==-1 || t.toString().indexOf("Risk")!==-1) {
                    console.log("[!] Hiding Dialog Title: " + t);
                    this._blocked = true;
                    return this.setTitle("");
                }
                return this.setTitle(t);
            };
            Builder.setMessage.overload('java.lang.CharSequence').implementation = function(m) {
                if (m.toString().indexOf("Risk")!==-1 || m.toString().indexOf("threat")!==-1) {
                    console.log("[!] Hiding Dialog Message: " + m);
                    this._blocked = true;
                    return this.setMessage("");
                }
                return this.setMessage(m);
            };
            Builder.show.implementation = function() {
                if (this._blocked) return null;
                return this.show();
            };
        } catch (e) {}

        // Events Firewall
        try {
            var Events = Java.use("com.miniclip.events.EventsReceiver");
            var bad = ["Magisk","Root","Frida","Hook","Overlay"];
            Events.onReceive.implementation = function(c, i) {
                if(i && i.getAction()) {
                    var a = i.getAction();
                    for(var k=0; k<bad.length; k++) if(a.indexOf(bad[k])!==-1) return;
                }
                return this.onReceive(c, i);
            };
        } catch(e) {}

        // Watchdog Disable
        try {
            var RTM = Java.use("com.miniclip.eightballpool.rtm.ResponseTimeMonitorRunnable");
            RTM.run.implementation = function() { console.log("[+] Watchdog Disabled"); return; };
        } catch(e) {}
    });
}
