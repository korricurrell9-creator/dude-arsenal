// dude_v2_overlay.js
Java.perform(function() {
    console.log("[*] DUDE: Version 2.2 Overlay - Interface Implementation Mode...");

    var Activity = Java.use("android.app.Activity");
    var View = Java.use("android.view.View");
    var ViewGroup = Java.use("android.view.ViewGroup");
    var TextView = Java.use("android.widget.TextView");
    var Color = Java.use("android.graphics.Color");
    var Gravity = Java.use("android.view.Gravity");
    var LayoutParams = Java.use("android.widget.FrameLayout$LayoutParams");
    var Runnable = Java.use("java.lang.Runnable");

    function addOverlay(activity) {
        var MyRunnable = Java.registerClass({
            name: 'com.dude.OverlayRunnable' + Math.floor(Math.random() * 1000),
            implements: [Runnable],
            methods: {
                run: function() {
                    try {
                        var context = activity.getApplicationContext();
                        var tv = TextView.$new(context);
                        tv.setText("☢️ DUDE MASTER BYPASS ACTIVE ☢️");
                        tv.setTextColor(Color.RED.value);
                        tv.setTextSize(30);
                        tv.setGravity(Gravity.CENTER.value);
                        tv.setBackgroundColor(Color.parseColor("#EE000000")); // Solid-ish black
                        tv.setPadding(40, 40, 40, 40);

                        var params = LayoutParams.$new(
                            LayoutParams.MATCH_PARENT.value,
                            LayoutParams.WRAP_CONTENT.value
                        );
                        params.gravity.value = Gravity.TOP.value;
                        params.topMargin.value = 100;

                        var decor = activity.getWindow().getDecorView();
                        // Get the decor view as a ViewGroup to add the text
                        var vg = Java.cast(decor, ViewGroup);
                        vg.addView(tv, params);
                        tv.bringToFront();
                        
                        console.log("[+] DUDE: Overlay forced into " + activity.getClass().getName());
                    } catch (e) {
                        console.log("[-] DUDE Runnable Error: " + e);
                    }
                }
            }
        });

        activity.runOnUiThread(MyRunnable.$new());
    }

    Activity.onResume.implementation = function() {
        this.onResume();
        console.log("[*] DUDE: onResume triggered for " + this.getClass().getName());
        addOverlay(this);
    };

    Java.choose("android.app.Activity", {
        onMatch: function(a) {
            console.log("[*] DUDE: Found activity for injection: " + a.getClass().getName());
            addOverlay(a);
        },
        onComplete: function() {
            console.log("[*] DUDE: Initial injection cycle finished.");
        }
    });
});
