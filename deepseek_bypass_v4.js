// deepseek_bypass_v4.js
Java.perform(function() {
    console.log("[*] DUDE: DeepSeek Bypass v4 - Global NPE & PairIP Bypass...");

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
                // Log arguments
                var args = [];
                for (var i = 0; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }
                console.log("[*] DUDE: ja.b.c(" + args.join(", ") + ") called.");

                // Check for null strings in arguments
                for (var i = 0; i < arguments.length; i++) {
                    if (arguments[i] === null) {
                        console.log("[+] DUDE: ja.b.c arg[" + i + "] is NULL. Investigating...");
                        // If it's the 3-arg one, and first is null, it crashes.
                        if (arguments.length === 3 && i === 0) {
                             console.log("[+] DUDE: Fixing null string in 3-arg ja.b.c");
                             arguments[0] = "";
                        }
                    }
                }

                try {
                    return overload.apply(this, arguments);
                } catch (err) {
                    console.log("[!] DUDE: ja.b.c caught exception: " + err);
                    // Return a default value based on return type if possible
                    // For now, return empty string if it's a String return type
                    return "";
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
