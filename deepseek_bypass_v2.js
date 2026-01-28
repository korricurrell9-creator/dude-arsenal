// deepseek_bypass_v2.js
Java.perform(function() {
    console.log("[*] DUDE: DeepSeek Bypass v2 - NPE & PairIP Bypass...");

    // Bypass com.pairip.licensecheck.LicenseClient
    try {
        var LicenseClient = Java.use('com.pairip.licensecheck.LicenseClient');
        LicenseClient.connectToLicensingService.implementation = function() {
            console.log("[+] DUDE: Bypassing connectToLicensingService.");
            return; 
        };
    } catch (e) { console.log("[-] PairIP hook failed: " + e); }

    // Bypass NPE in ja.b.c
    try {
        var ja_b = Java.use('ja.b');
        ja_b.c.implementation = function(arg1) {
            console.log("[*] DUDE: ja.b.c called with: " + arg1);
            if (arg1 === null) {
                console.log("[+] DUDE: ja.b.c received NULL, returning empty string to prevent NPE.");
                return "";
            }
            try {
                return this.c(arg1);
            } catch (err) {
                console.log("[!] DUDE: ja.b.c crashed even with non-null arg. Returning empty.");
                return "";
            }
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
