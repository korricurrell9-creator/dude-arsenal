console.log("[*] DUDE: Diagnostics Loading...");
Java.perform(function() {
    console.log("[*] DUDE: Java.perform fired!");
    var Activity = Java.use("android.app.Activity");
    Activity.onResume.implementation = function() {
        console.log("[+] Activity Resumed: " + this.getClass().getName());
        this.onResume();
    };
});
