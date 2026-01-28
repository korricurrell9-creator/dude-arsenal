// Frida script v2 for 8 Ball Pool
// Attempts to bypass both root detection and a subsequent anti-tampering crash.

Java.perform(function() {
    console.log("[*] Starting advanced bypass script (v2)...");

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

    // --- Bypass 2: Anti-Tampering (Crash) ---
    // The crash log suggests a check using 'asg_com.android.apksig.ApkVerifier'.
    // We will hook its 'verify' method to prevent the integrity check from crashing the app.
    try {
        // The class name is inferred from the 'asg_' prefix in the crash log.
        var tamperCheckClass = 'asg_com.android.apksig.ApkVerifier';
        var ApkVerifier = Java.use(tamperCheckClass);

        // The 'verify' method may have multiple versions (overloads). We will neutralize all of them.
        ApkVerifier.verify.overloads.forEach(function(overload) {
            overload.implementation = function() {
                console.log("[+] Bypassed anti-tamper check (" + tamperCheckClass + ".verify).");
                // This method likely returns 'void' on success and throws an error on failure.
                // By simply returning, we prevent the check and the potential crash.
                return;
            };
        });
        console.log("[*] Anti-tampering hooks installed for " + tamperCheckClass);

    } catch (error) {
        console.error("[!] Failed to hook anti-tampering check: " + error.message);
        console.error("[!] The class '" + tamperCheckClass + "' might be incorrect, or another protection is active.");
    }
    
    // --- Bypass 3: System.exit (Fallback) ---
    // As a precaution, this blocks any attempts by the app to close itself using System.exit().
    try {
        var System = Java.use('java.lang.System');
        System.exit.implementation = function(status) {
            console.log("[!] Blocked a call to System.exit(" + status + ")");
        };
        console.log("[*] System.exit hook installed.");
    } catch (error) {
        console.error("[!] Failed to hook System.exit: " + error.message);
    }
});
