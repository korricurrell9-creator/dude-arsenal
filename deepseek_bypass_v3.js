// deepseek_bypass_v3.js
Java.perform(function() {
    console.log("[*] DUDE: DeepSeek Bypass v3 - Corrected NPE & PairIP Bypass...");

    // Bypass com.pairip.licensecheck.LicenseClient
    try {
        var LicenseClient = Java.use('com.pairip.licensecheck.LicenseClient');
        LicenseClient.connectToLicensingService.implementation = function() {
            console.log("[+] DUDE: Bypassing connectToLicensingService.");
            return; 
        };
    } catch (e) { }

    // Bypass NPE in ja.b.c
    try {
        var ja_b = Java.use('ja.b');
        
        // Handle the 3-arg overload
        ja_b.c.overload('java.lang.String', '[B', 'java.util.Map').implementation = function(s, b, m) {
            console.log("[*] DUDE: ja.b.c(String, byte[], Map) called. String: " + s);
            if (s === null) {
                console.log("[+] DUDE: ja.b.c received NULL String, returning empty string.");
                return "";
            }
            return this.c(s, b, m);
        };

        // Handle the 0-arg overload just in case
        ja_b.c.overload().implementation = function() {
            console.log("[*] DUDE: ja.b.c() called.");
            return this.c();
        };

    } catch (e) { console.log("[-] ja.b.c hook failed: " + e); }

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
