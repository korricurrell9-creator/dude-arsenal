// deepseek_bypass.js
Java.perform(function() {
    console.log("[*] DUDE: DeepSeek / PairIP Bypass Initializing...");

    // Bypass com.pairip.licensecheck.LicenseClient
    try {
        var LicenseClient = Java.use('com.pairip.licensecheck.LicenseClient');
        
        // Try to hook the check method if it exists
        // Looking at common PairIP patterns, it often has a 'check' or 'run' method
        
        // Based on logcat, connectToLicensingService throws LicenseCheckException
        LicenseClient.connectToLicensingService.implementation = function() {
            console.log("[+] DUDE: Bypassing connectToLicensingService exception.");
            // Do nothing, or return what is expected if it has a return type
            return; 
        };

        console.log("[+] DUDE: PairIP LicenseClient hooks applied.");
    } catch (e) {
        console.log("[-] DUDE: Failed to hook PairIP: " + e);
    }

    // Bypass common Play Store installer checks
    try {
        var PackageManager = Java.use('android.app.ApplicationPackageManager');
        PackageManager.getInstallerPackageName.implementation = function(packageName) {
            if (packageName === "com.deepseek.chat") {
                console.log("[+] DUDE: Spoofing installer for DeepSeek.");
                return "com.android.vending"; // Pretend it was installed by Play Store
            }
            return this.getInstallerPackageName(packageName);
        };
    } catch (e) {
        console.log("[-] DUDE: Failed to hook getInstallerPackageName: " + e);
    }

    // Prevent System.exit just in case
    var System = Java.use('java.lang.System');
    System.exit.implementation = function(status) {
        console.log("[+] DUDE: System.exit(" + status + ") blocked.");
    };

});
