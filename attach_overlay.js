// attach_overlay.js
Java.perform(function() {
    console.log("[*] DUDE: Targeted attach starting...");
    var TargetActivity = "com.ss.android.ugc.aweme.main.MainActivity";

    function slap(act) {
        if (!act) return;
        Java.scheduleOnMainThread(function() {
            try {
                var TextView = Java.use("android.widget.TextView");
                var Color = Java.use("android.graphics.Color");
                var Gravity = Java.use("android.view.Gravity");
                var FrameLayout = Java.use("android.widget.FrameLayout");
                var String = Java.use("java.lang.String");

                var decor = act.getWindow().getDecorView();
                if (decor.findViewWithTag("DUDE")) return;

                var tv = TextView.$new(act);
                tv.setTag("DUDE");
                tv.setText(String.$new("☢️ DUDE ROOTED ☢️"));
                tv.setTextColor(Color.GREEN.value);
                tv.setBackgroundColor(Color.BLACK.value);
                tv.setTextSize(60);
                tv.setGravity(Gravity.CENTER.value);
                
                var params = FrameLayout.LayoutParams.$new(-1, -1, Gravity.CENTER.value);
                act.addContentView(tv, params);
                console.log("[+] DUDE: Targeted overlay slapped on " + act.getClass().getName());
            } catch(e) {
                console.log("[-] Slap failed: " + e);
            }
        });
    }

    Java.choose(TargetActivity, {
        onMatch: function(a) { slap(a); },
        onComplete: function() { console.log("[*] Hunt complete."); }
    });

    try {
        Java.use(TargetActivity).onResume.implementation = function() {
            this.onResume();
            slap(this);
        };
    } catch(e) {}
});