// deepseek_bypass_v7.js
Java.perform(function() {
    console.log("[*] DUDE: DeepSeek Bypass v7 - Hardware Attestation & Login Fix...");

    var be_s = null;
    try {
        be_s = Java.use('be.s');
    } catch (e) { }

    // 1. PairIP / ja.b.c Restoration
    try {
        var LicenseClient = Java.use('com.pairip.licensecheck.LicenseClient');
        LicenseClient.connectToLicensingService.implementation = function() {
            console.log("[+] DUDE: Bypassing connectToLicensingService.");
            return; 
        };
    } catch (e) { }

    try {
        var ja_b = Java.use('ja.b');
        ja_b.c.overloads.forEach(function(overload) {
            overload.implementation = function() {
                try {
                    var res = overload.apply(this, arguments);
                    return res;
                } catch (err) {
                    console.log("[!] DUDE: ja.b.c caught exception: " + err);
                    if (be_s) {
                        console.log("[+] DUDE: Returning success be.s instance.");
                        return be_s.$new(200); // 200 = Success in many of these libs
                    }
                    return null;
                }
            };
        });
    } catch (e) { }

    // 2. Hardware Attestation Bypass (KeyStore)
    try {
        var KeyGenParameterSpecBuilder = Java.use("android.security.keystore.KeyGenParameterSpec$Builder");
        KeyGenParameterSpecBuilder.setAttestationChallenge.implementation = function(challenge) {
            console.log("[+] DUDE: Blocking KeyStore Attestation Challenge.");
            return this;
        };
        KeyGenParameterSpecBuilder.setDevicePropertiesAttestationIncluded.implementation = function(included) {
            console.log("[+] DUDE: Disabling Device Properties Attestation.");
            return this;
        };
    } catch (e) { }

    // 3. SSL Pinning Bypass (Global)
    try {
        var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");
        TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
            console.log("[+] DUDE: SSL Bypass -> " + host);
            return untrustedChain;
        };
    } catch (e) { }

    // 4. Installer & GMS Spoofer
    try {
        var PackageManager = Java.use('android.app.ApplicationPackageManager');
        PackageManager.getInstallerPackageName.implementation = function(packageName) {
            return "com.android.vending";
        };

        var GoogleApiAvailability = Java.use("com.google.android.gms.common.GoogleApiAvailability");
        GoogleApiAvailability.isGooglePlayServicesAvailable.overload('android.content.Context').implementation = function(c) {
            return 0; // Success
        };
    } catch (e) { }

    // 5. System.exit prevention
    try {
        var System = Java.use('java.lang.System');
        System.exit.implementation = function(s) {
            console.log("[+] DUDE: Blocked System.exit(" + s + ")");
        };
    } catch (e) { }

    console.log("[*] DUDE: v7 Active. Breaching login sequence...");
});
