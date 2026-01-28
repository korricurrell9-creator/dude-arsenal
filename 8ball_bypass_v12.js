
// --- 8 Ball Pool Ultimate Bypass v12 (EventsReceiver & Black Screen Fix) ---
// 
// ISSUE: The app is stable (no crash), but black screen means we blocked something vital.
// CAUSE: "EventsReceiver" collects data (including detection events) and sends it to Native.
//        If we block too much, the game logic waits for a callback that never comes.
//        BUT, we must block the "Detection" events.
//
// STRATEGY:
// 1. Hook EventsReceiver to filter OUT bad events (Magisk, Frida, Root) but ALLOW normal events.
// 2. Keep RTM Watchdog disabled (essential for stability).
// 3. Relax the "Freeze" logic: Only freeze if we are 100% sure it's a kill attempt.

console.log("[*] Injecting v12 Bypass...");

// ============================================================================
// PART 1: EVENT FILTERING (The Surgeon's Knife)
// ============================================================================
if (Java.available) {
    Java.perform(function() {
        console.log("[*] Java Hooks Loading...");

        // 1. RTM Watchdog Disable (Keep this, it's working)
        try {
            var RTMRunnable = Java.use("com.miniclip.eightballpool.rtm.ResponseTimeMonitorRunnable");
            RTMRunnable.run.implementation = function() {
                console.log("[+] Watchdog (RTM) Disabled.");
                return; 
            };
        } catch (e) {}

        // 2. EventsReceiver Hook (THE NEW FIX)
        try {
            var EventsReceiver = Java.use("com.miniclip.events.EventsReceiver");
            
            // Hook the lambda or the processing method to filter bad events
            // The method m9046lambda$onReceive$0$comminiclipeventsEventsReceiver is triggered by Intents.
            // We'll hook Process(EventBlob) to drop bad blobs.

            EventsReceiver.Process.implementation = function(eventBlob) {
                // We can't easily read the blob content here, but we can hook the caller.
                // Better approach: Hook onReceive and check the Intent Action.
                // But wait, onReceive spawns a thread.
                // Let's hook the method that processes specific fields.
                
                // Let's go for the jugular: Hook sendBlobsNative
                // Use a different strategy: Hook the internal "Send" or "Process" logic.
                // Actually, let's filter based on the BroadcastReceiver Intent action.
                // If we block the "MagiskDetected" intent, the game never knows.
                
                // We will rely on blocking the *sending* of the event to native.
                // But we must let other events pass to avoid black screen.
                
                return this.Process(eventBlob); // Allow by default for now, see below
            };

            // Hook onReceive to filter specific detection intents
            EventsReceiver.onReceive.implementation = function(context, intent) {
                var action = intent.getAction();
                if (action) {
                    if (action.indexOf("Magisk") !== -1 || 
                        action.indexOf("Frida") !== -1 || 
                        action.indexOf("Root") !== -1 ||
                        action.indexOf("Hook") !== -1 ||
                        action.indexOf("Overlay") !== -1) {
                        
                        console.log("[+] BLOCKED Detection Event: " + action);
                        return; // Drop this intent completely
                    }
                }
                // console.log("[*] Allowed Event: " + action);
                return this.onReceive(context, intent);
            };
            
        } catch (e) {
            console.log("[-] EventsReceiver hook failed: " + e.message);
        }

        // 3. ExceptionHandler Blocking (AppLovin)
        try {
            var AppLovinHandler = Java.use("com.applovin.impl.sdk.AppLovinExceptionHandler");
            AppLovinHandler.uncaughtException.implementation = function(thread, th) {
                console.log("[!] BLOCKED AppLovin Exception: " + th.toString());
                return; // Suppress exit
            };
        } catch(e) {}

        // 4. File System Listing Hiding (Keep this)
        try {
            var File = Java.use("java.io.File");
            var targets = ["su", "magisk", "busybox", "Superuser", "daemonsu", "frida"];
            
            File.list.overload().implementation = function() {
                var result = this.list();
                if (!result) return result;
                var filtered = [];
                for (var i = 0; i < result.length; i++) {
                    var name = result[i];
                    var safe = true;
                    for (var j=0; j<targets.length; j++) if (name.indexOf(targets[j])!==-1) safe=false;
                    if (safe) filtered.push(name);
                }
                return filtered;
            };
        } catch (e) {}

        console.log("[*] v12 Java Hooks Active.");
    });
}

// ============================================================================
// PART 2: NATIVE BYPASS (Relaxed)
// ============================================================================
var libc = null;
try { libc = Process.getModuleByName("libc.so"); } catch (e) {}

if (libc) {
    // We only block explicit self-kill. 
    // Blocking exit() globally might be causing the black screen if the app restarts itself or a sub-process.
    
    var killPtr = libc.findExportByName("kill");
    if (killPtr) {
        Interceptor.attach(killPtr, {
            onEnter: function(args) {
                var pid = parseInt(args[0]);
                if (pid === Process.id) {
                     console.log("[!!!] NATIVE KILL(self) DETECTED! Freezing thread.");
                     Thread.sleep(3600000);
                }
            }
        });
    }

    // We do NOT hook exit/abort globally this time.
    // If the app calls exit(0) during normal startup (e.g. forking), blocking it causes a hang/black screen.
    // We rely on the Java hooks to prevent the detection that leads to the exit.
}
