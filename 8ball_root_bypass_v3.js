// Frida script v3 for 8 Ball Pool
// Adds native exit tracing to diagnose the "Process terminated" issue.

Java.perform(function() {
    console.log("[*\] Starting advanced bypass script (v3)...");

    // --- Bypass 1: Root Detection ---
    try {
        var rootCheckClass = 'io.bidmachine.DeviceInfo';
        var rootCheckMethod = 'isDeviceRooted';
        var DeviceInfo = Java.use(rootCheckClass);

        DeviceInfo[rootCheckMethod].implementation = function() {
            console.log("[+] Bypassed root check (" + rootCheckClass + "." + rootCheckMethod + ") and returning 'false'.");
            return false;
        };
        console.log("[*\x5d Root detection hook installed.");
    } catch (error) {
        console.error("[!] Failed to hook root detection: " + error.message);
    }

    // --- Bypass 2: Anti-Tampering (Java Crash) ---
    try {
        var tamperCheckClass = 'asg_com.android.apksig.ApkVerifier';
        var ApkVerifier = Java.use(tamperCheckClass);
        ApkVerifier.verify.overloads.forEach(function(overload) {
            overload.implementation = function() {
                console.log("[+] Bypassed anti-tamper check (" + tamperCheckClass + ".verify).");
                return;
            };
        });
        console.log("[*\x5d Anti-tampering hooks installed for " + tamperCheckClass);
    } catch (error) {
        console.error("[!] Failed to hook anti-tampering check: " + error.message);
    }
    
    // --- Bypass 3: System.exit (Java) ---
    try {
        var System = Java.use('java.lang.System');
        System.exit.implementation = function(status) {
            console.log("[!] Blocked a call to System.exit(" + status + ")");
        };
        console.log("[*\x5d System.exit hook installed.");
    } catch (error) {
        console.error("[!] Failed to hook System.exit: " + error.message);
    }

    // --- Diagnostic 4: Native Exit Hook ---
    // The process is still terminating. This hook checks if it's calling the native C exit() function.
    try {
        var exitPtr = Module.findExportByName(null, "exit");
        Interceptor.attach(exitPtr, {
            onEnter: function(args) {
                console.log("[!] NATIVE C-level exit() WAS CALLED with status code: " + args[0].toInt32());
                // Log the stack trace to see what triggered the exit
                console.log("[!] Stack trace:\n" + Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join('\n') + "\n");
            }
        });
        console.log("[*\x5d Native exit() diagnostic hook installed.");
    } catch (error) {
        console.error("[!] Failed to hook native exit(): " + error.message);
    }
});
