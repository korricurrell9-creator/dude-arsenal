// deepseek_bypass_v5.js
Java.perform(function() {
    console.log("[*] DUDE: DeepSeek Bypass v5 - Advanced NPE & PairIP Bypass...");

    // Bypass com.pairip.licensecheck.LicenseClient
    try {
        var LicenseClient = Java.use('com.pairip.licensecheck.LicenseClient');
        LicenseClient.connectToLicensingService.implementation = function() {
            console.log("[+] DUDE: Bypassing connectToLicensingService.");
            return; 
        };
    } catch (e) { }

    // Bypass NPE in ja.b.c - Hooking ALL overloads
    try {
        var ja_b = Java.use('ja.b');
        ja_b.c.overloads.forEach(function(overload) {
            overload.implementation = function() {
                try {
                    return overload.apply(this, arguments);
                } catch (err) {
                    console.log("[!] DUDE: ja.b.c caught exception: " + err);
                    // Log stack trace of the error
                    // console.log(Java.use("android.util.Log").getStackTraceString(err));
                    
                    // Return null instead of "" to satisfy object return type requirements
                    return null;
                }
            };
        });
    } catch (e) { console.log("[-] ja.b.c global hook failed: " + e); }

    // Spoof installer
    try {
        var PackageManager = Java.use('android.app.ApplicationPackageManager');
        PackageManager.getInstallerPackageName.implementation = function(packageName) {
            if (packageName === "com.deepseek.chat") {
                return "com.android.vending";
            }
            return this.getInstallerPackageName(packageName);
        };
    } catch (e) { }

    // Prevent System.exit
    try {
        var System = Java.use('java.lang.System');
        System.exit.implementation = function(status) {
            console.log("[+] DUDE: System.exit(" + status + ") blocked.");
        };
    } catch (e) { }
});
