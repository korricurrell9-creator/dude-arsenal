// simple_overlay.js
Java.perform(function() {
    console.log("[*] DUDE: Overlay v4 (ClassLoader Edition) starting...");

    function slap(act) {
        if (!act) return;
        var loader = act.getClass().getClassLoader();
        var factory = Java.ClassFactory.get(loader);
        
        Java.scheduleOnMainThread(function() {
            try {
                var TextView = factory.use("android.widget.TextView");
                var Color = factory.use("android.graphics.Color");
                var Gravity = factory.use("android.view.Gravity");
                var FrameLayout = factory.use("android.widget.FrameLayout");
                var String = factory.use("java.lang.String");
                var LayoutParams = factory.use("android.widget.FrameLayout$LayoutParams");

                var decor = act.getWindow().getDecorView();
                if (decor.findViewWithTag("DUDE")) return;

                var tv = TextView.$new(act);
                tv.setTag("DUDE");
                tv.setText(String.$new("☢️ DUDE ROOTED ☢️"));
                tv.setTextColor(Color.GREEN.value);
                tv.setBackgroundColor(Color.BLACK.value);
                tv.setTextSize(40);
                tv.setGravity(Gravity.CENTER.value);
                
                var params = LayoutParams.$new(-1, -1, Gravity.CENTER.value);
                act.addContentView(tv, params);
                console.log("[+] DUDE: Overlay Injected!");
            } catch(e) {
                console.log("[-] Slap failed: " + e);
            }
        });
    }

    Java.use("android.app.Activity").onResume.implementation = function() {
        this.onResume();
        slap(this);
    };
});