// dude_verify_ui.js
Java.perform(function() {
    Java.scheduleOnMainThread(function() {
        var ActivityThread = Java.use('android.app.ActivityThread');
        var thread = ActivityThread.currentActivityThread();
        var mActivitiesField = thread.getClass().getDeclaredField("mActivities");
        mActivitiesField.setAccessible(true);
        var mActivities = mActivitiesField.get(thread);
        var activities = mActivities.values().toArray();
        
        console.log("[*] DUDE: UI VERIFICATION REPORT");
        for(var i=0; i<activities.length; i++){
            var clientRecord = activities[i];
            var activityField = clientRecord.getClass().getDeclaredField("activity");
            activityField.setAccessible(true);
            var act = activityField.get(clientRecord);
            if(act){
                var decor = act.getWindow().getDecorView();
                var top = decor.findViewWithTag("DUDE_TOP");
                var bottom = decor.findViewWithTag("DUDE_BOTTOM");
                
                console.log("Activity: " + act.getClass().getName());
                console.log("  - Top Overlay (DUDE_TOP): " + (top ? "FOUND ✅" : "MISSING ❌"));
                if(top) console.log("    Text: " + top.getText().toString());
                
                console.log("  - Bottom Overlay (DUDE_BOTTOM): " + (bottom ? "FOUND ✅" : "MISSING ❌"));
                if(bottom) console.log("    Text: " + bottom.getText().toString());
            }
        }
    });
});
