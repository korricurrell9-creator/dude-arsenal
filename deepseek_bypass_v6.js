// deepseek_bypass_v6.js
Java.perform(function() {
    console.log("[*] DUDE: DeepSeek Bypass v6 - Full be.s Restoration...");

    var be_s = null;
    try {
        be_s = Java.use('be.s');
    } catch (e) { console.log("[-] be.s not found."); }

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
                    if (be_s) {
                        console.log("[+] DUDE: Returning new be.s instance to satisfy caller.");
                        // Try to return a "success" instance. 200 is often success in these libs.
                        try {
                            return be_s.$new(200);
                        } catch (e2) {
                            return be_s.$new();
                        }
                    }
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
