
// --- 8 Ball Pool Ultimate Bypass v9 (The "ResponseTimeMonitor" Fix) ---
// Based on user provided decompilation of:
// com.miniclip.eightballpool.rtm.ResponseTimeMonitorRunnable
// This class implements an "ANR Supervisor" that kills the app if the main thread is too slow.
// Since Frida slows down the main thread, this supervisor thinks the app is frozen and kills it.

console.log("[*] Injecting v9 Bypass (RTM Fix)...");

// ============================================================================
// PART 1: DISABLE THE WATCHDOG (Java)
// ============================================================================
if (Java.available) {
    Java.perform(function() {
        console.log("[*] Disabling ResponseTimeMonitor Watchdog...");

        try {
            var RTMRunnable = Java.use("com.miniclip.eightballpool.rtm.ResponseTimeMonitorRunnable");

            // 1. Hook the run() method to prevent the loop from ever starting
            RTMRunnable.run.implementation = function() {
                console.log("[+] BLOCKED ResponseTimeMonitorRunnable.run() - Watchdog disabled.");
                // We simply return, effectively killing the supervisor thread logic
                return;
            };

            // 2. Prevent the lambda that triggers the "Emergency KILL"
            // Note: Hooking lambdas can be tricky as names are obfuscated (e.g., lambda$run$0).
            // We'll rely on blocking run(), but we can also try to hook the kill methods directly.
            
            // 3. Hook stop/resume just in case
            RTMRunnable.stop.implementation = function() {
                console.log("[*] RTM stop() called (ignored)");
            };

        } catch (e) {
            console.log("[-] Failed to hook ResponseTimeMonitorRunnable: " + e.message);
        }

        // --- Block the Kill Commands in the RTM Class ---
        // The class calls Runtime.getRuntime().halt(0) and Process.killProcess(Process.myPid())
        
        try {
            var Runtime = Java.use("java.lang.Runtime");
            Runtime.halt.implementation = function(code) {
                console.log("[!] BLOCKED Java Runtime.halt(" + code + ")");
            };
        } catch (e) {}

        try {
            var Process = Java.use("android.os.Process");
            Process.killProcess.implementation = function(pid) {
                console.log("[!] BLOCKED Java Process.killProcess(" + pid + ")");
            };
        } catch (e) {}

        // --- Existing v8 Hooks (Dialogs & Native Hiding) ---
        // Re-applying key v8 hooks to ensure full coverage
        try {
            var ErrorDialog = Java.use("com.miniclip.utils.ErrorDialog");
            ErrorDialog.displayErrorMessage.overload('java.lang.String', 'java.lang.String').implementation = function(t, m) {
                console.log("[!] BLOCKED ErrorDialog: " + t); return;
            };
        } catch (e) {}
        
        try {
             var MCApp = Java.use("com.miniclip.platform.MCApplication");
             MCApp.signalFatalError.implementation = function(c) { console.log("[!] BLOCKED SignalFatalError: " + c); };
        } catch(e) {}

        console.log("[*] Java Watchdog Neutralized.");
    });
}

// ============================================================================
// PART 2: NATIVE DEFENSE (Keep the freeze as a safety net)
// ============================================================================
var libc = null;
try {
    libc = Process.getModuleByName("libc.so");
} catch (e) {}

if (libc) {
    function hookNativeFunc(name, onEnterFunc) {
        var ptr = libc.findExportByName(name);
        if (ptr) {
            try { Interceptor.attach(ptr, { onEnter: onEnterFunc }); } catch (e) {}
        }
    }
    
    // We relax the freeze slightly: only log, don't freeze immediately unless sure.
    // Actually, stick to freezing because if the watchdog fires natively, we are dead anyway.
    var freezeThread = function(args) {
        console.log("[!!!] NATIVE EXIT TRIGGERED! Freezing thread.");
        Thread.sleep(3600000); 
    };

    hookNativeFunc("exit", freezeThread);
    hookNativeFunc("_exit", freezeThread);
    hookNativeFunc("abort", freezeThread);
    hookNativeFunc("kill", function(args) {
        if (parseInt(args[0]) === Process.id) {
             console.log("[!!!] NATIVE KILL(self) TRIGGERED! Freezing.");
             Thread.sleep(3600000);
        }
    });
}
