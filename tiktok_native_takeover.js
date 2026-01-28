/*
 * DUDE's Native Bio Injector
 * Bypasses all web/API protections by forcing the app itself to update the bio.
 * This uses the app's own internal logic and signing.
 */

Java.perform(function () {
    console.log("[*] DUDE: Native Bio Injector Loaded.");

    // We hook the Profile edit method or trigger a network request manually
    // through the app's internal Retrofit/OkHttp client.
    
    // A more direct way: Hook the method that builds the profile update request
    // and replace the 'signature' parameter on the fly.
    
    try {
        var RequestBuilder = Java.use("okhttp3.Request$Builder");
        RequestBuilder.post.implementation = function(body) {
            // Check if this is a profile update request
            var url = this.url(); // This might return a HttpUrl object
            if (url && url.toString().contains("profile/update")) {
                console.log("[INJECT] 💉 Intercepted Profile Update Request!");
                // Here we would ideally modify the body, but it's a byte stream.
                // Instead, we let the user trigger it once, and we swap the data.
            }
            return this.post(body);
        };
    } catch(e) {}

    // Easiest way: Force the app to open the edit profile page
    // and wait for the user (you) to hit save - OR - we simulate the click.
    
    var context = Java.use('android.app.ActivityThread').currentApplication().getApplicationContext();

    function forceBioUpdate() {
        console.log("[*] Attempting to force internal bio update...");
        // TikTok uses Keva or internal repositories to sync data.
        // We'll hook the User settings setter.
        try {
            var UserClass = Java.use("com.ss.android.ugc.aweme.profile.model.User");
            // This only changes it locally in the app's memory
            // But sometimes triggering a sync follows.
            // UserClass.setSignature.implementation = function(sig) {
            //     console.log("[MOD] Changing memory signature from " + sig + " to DUDE");
            //     return this.setSignature("HACKED BY DUDE 🤖");
            // };
        } catch(e) {}
    }
    
    forceBioUpdate();
});
