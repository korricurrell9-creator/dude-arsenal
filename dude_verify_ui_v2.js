// dude_verify_ui_v2.js
Java.perform(function() {
    console.log("[*] DUDE: Running UI Verification...");
    Java.scheduleOnMainThread(function() {
        try {
            var ActivityThread = Java.use('android.app.ActivityThread');
            var thread = ActivityThread.currentActivityThread();
            var activities = thread.mActivities.value.values().toArray();
            
            for (var i = 0; i < activities.length; i++) {
                var activity = activities[i].activity.value.get();
                if (activity) {
                    var decor = activity.getWindow().getDecorView();
                    var top = decor.findViewWithTag("DUDE_TOP");
                    var bottom = decor.findViewWithTag("DUDE_BOTTOM");
                    
                    console.log("[REPORT] Activity: " + activity.getClass().getName());
                    if (top) console.log("[REPORT] DUDE_TOP: ENABLED ✅ ('" + top.getText() + "')");
                    if (bottom) console.log("[REPORT] DUDE_BOTTOM: ENABLED ✅ ('" + bottom.getText() + "')");
                }
            }
        } catch (e) {
            // console.log("[-] Verification failed: " + e.message);
        }
    });
});
