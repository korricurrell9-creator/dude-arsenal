// Frida script v4 for 8 Ball Pool
// Replaces the native exit() hook with one for abort() to diagnose termination.

Java.perform(function() {
    console.log("[*] Starting advanced bypass script (v4)...");

    // --- Bypass 1: Root Detection ---
    try {
        var rootCheckClass = 'io.bidmachine.DeviceInfo';
        var rootCheckMethod = 'isDeviceRooted';
        var DeviceInfo = Java.use(rootCheckClass);
        DeviceInfo[rootCheckMethod].implementation = function() {
            console.log("[+] Bypassed root check (" + rootCheckClass + "." + rootCheckMethod + ") and returning 'false'.");
            return false;
        };
        console.log("[*] Root detection hook installed.");
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
        console.log("[*] Anti-tampering hooks installed for " + tamperCheckClass);
    } catch (error) {
        console.error("[!] Failed to hook anti-tampering check: " + error.message);
    }
    
    // --- Bypass 3: System.exit (Java) ---
    try {
        var System = Java.use('java.lang.System');
        System.exit.implementation = function(status) {
            console.log("[!] Blocked a call to System.exit(" + status + ")");
        };
        console.log("[*] System.exit hook installed.");
    } catch (error) {
        console.error("[!] Failed to hook System.exit: " + error.message);
    }

    // --- Diagnostic 4: Native Abort Hook ---
    // Since exit() was not found, let's try to hook abort().
    try {
        var abortPtr = Module.findExportByName(null, "abort");
        if (abortPtr) {
            Interceptor.attach(abortPtr, {
                onEnter: function(args) {
                    console.log("[!] NATIVE C-level abort() WAS CALLED.");
                    console.log("[!] Stack trace:\n" + Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join('\n') + "\n");
                }
            });
            console.log("[*] Native abort() diagnostic hook installed.");
        } else {
            console.log("[!] Native abort() function not found. The app may use direct syscalls to terminate.");
        }
    } catch (error) {
        console.error("[!] Failed to hook native abort(): " + error.message);
    }
});
