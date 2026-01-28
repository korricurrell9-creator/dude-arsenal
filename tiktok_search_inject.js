/*
 * DUDE's Search Injection & RPC
 * Goal: Force the app to search for arbitrary queries or open deep links.
 */

Java.perform(function () {
    console.log("[*] DUDE: Search Injection Module Loaded.");

    var context = null;
    var ActivityThread = Java.use('android.app.ActivityThread');
    var app = ActivityThread.currentApplication();
    if (app) {
        context = app.getApplicationContext();
        console.log("[+] Got Context!");
    }

    // 1. DEEP LINK INJECTION: The most reliable way to force navigation
    // We can open: snssdk1180://search?keyword=HACKED
    // or: snssdk1180://user/profile/7574297133429703688
    function launchDeepLink(url) {
        if (!context) return;
        
        try {
            var Intent = Java.use("android.content.Intent");
            var Uri = Java.use("android.net.Uri");
            
            var intent = Intent.$new(Intent.ACTION_VIEW);
            intent.setData(Uri.parse(url));
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            
            context.startActivity(intent);
            console.log("[RPC] Launched Deep Link: " + url);
        } catch(e) {
            console.log("[-] Deep Link failed: " + e.message);
        }
    }

    // RPC Export so we can call it from Python/CLI if needed (via Frida's RPC)
    // For now, we just auto-trigger it on load after a delay.
    
    setTimeout(function() {
        console.log("[*] Triggering Search Injection...");
        // TikTok's scheme is usually snssdk1180:// or snssdk1233:// depending on region
        // We'll try common ones.
        launchDeepLink("snssdk1180://search?keyword=PWNED_BY_DUDE");
        launchDeepLink("snssdk1233://search?keyword=PWNED_BY_DUDE");
    }, 5000);

    // 2. CLIPBOARD HIJACK: Set clipboard so if they paste, they paste our payload
    try {
        var ClipboardManager = Java.use("android.content.ClipboardManager");
        var ClipData = Java.use("android.content.ClipData");
        var String = Java.use("java.lang.String");
        
        // We need to get the service from context
        // This is hard to do cleanly without an Activity instance sometimes.
        // We'll skip for now and rely on the Deep Link which is loud and visual.
    } catch(e) {}

});
