// gms_mock_bypass.js
// DUDE's GMS Mock & Google Play Bypass
// Specifically designed for devices WITHOUT Google Play Services.

Java.perform(function() {
    console.log("[*] DUDE: Initializing GMS Mock Bypass...");

    // 1. Mock GoogleApiAvailability (The "Is GMS installed?" check)
    try {
        var GoogleApiAvailability = Java.use("com.google.android.gms.common.GoogleApiAvailability");
        
        GoogleApiAvailability.getInstance.implementation = function() {
            console.log("[+] DUDE: Mocking GoogleApiAvailability instance.");
            return this.getInstance();
        };

        GoogleApiAvailability.isGooglePlayServicesAvailable.overload('android.content.Context').implementation = function(context) {
            console.log("[+] DUDE: Reporting GMS as AVAILABLE (Success).");
            return 0; // ConnectionResult.SUCCESS
        };

        GoogleApiAvailability.isGooglePlayServicesAvailable.overload('android.content.Context', 'int').implementation = function(context, minVersion) {
            console.log("[+] DUDE: Reporting GMS as AVAILABLE (Success) for version " + minVersion);
            return 0;
        };

        // Prevent the "Install Google Play Services" dialog
        GoogleApiAvailability.getErrorDialog.overload('android.app.Activity', 'int', 'int').implementation = function(activity, errorCode, requestCode) {
            console.log("[+] DUDE: Blocking GMS Error Dialog.");
            return null;
        };
    } catch (e) {
        console.log("[-] DUDE: GoogleApiAvailability not found in app (skipping).");
    }

    // 2. Mock Play Integrity / SafetyNet Task return values
    try {
        var Task = Java.use("com.google.android.gms.tasks.Task");
        Task.isSuccessful.implementation = function() {
            // This is dangerous as it might affect other tasks, but helpful for GMS ones
            // console.log("[?] DUDE: Task.isSuccessful() called.");
            return true;
        };
    } catch (e) {}

    // 3. Spoof Installer to be Play Store
    try {
        var PackageManager = Java.use("android.app.ApplicationPackageManager");
        PackageManager.getInstallerPackageName.implementation = function(packageName) {
            console.log("[+] DUDE: Spoofing Play Store installer for " + packageName);
            return "com.android.vending";
        };
    } catch (e) {}

    // 4. Mock BillingClient (In-App Purchases)
    try {
        // This is a common pattern for Billing v4+
        var BillingClient = Java.use("com.android.billingclient.api.BillingClientImpl");
        BillingClient.startConnection.implementation = function(listener) {
            console.log("[+] DUDE: Mocking BillingClient connection success.");
            // Normally you'd call onBillingSetupFinished on the listener
            return;
        };
    } catch (e) {}

    console.log("[*] DUDE: GMS Mock Bypass Active.");
});
