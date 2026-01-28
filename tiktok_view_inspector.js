/*
 * DUDE's View Inspector
 * Dumps the View Hierarchy to identify the exact ID of the follower count.
 */

Java.perform(function () {
    console.log("[*] DUDE: Inspector Gadget is running...");

    Java.scheduleOnMainThread(function() {
        var ActivityThread = Java.use('android.app.ActivityThread');
        var currentActivity = ActivityThread.currentActivityThread().getApplication().getApplicationContext();
        
        // We need the activity, not context, to get window
        // Let's rely on finding the Resume activity
        var activities = ActivityThread.sCurrentActivityThread.get().mActivities.values().toArray();
        var act = null;
        for(var i=0; i<activities.length; i++){
            if(!activities[i].paused.value){
                act = activities[i].activity.get();
                break;
            }
        }

        if(act){
            console.log("[+] Targeted Activity: " + act.getClass().getName());
            var decor = act.getWindow().getDecorView();
            dumpViews(decor, "");
        } else {
            console.log("[-] No active activity found. Touch the screen!");
        }

        function dumpViews(view, indent) {
            var className = view.getClass().getName();
            var id = view.getId();
            var idStr = (id !== -1) ? " (ID: 0x" + id.toString(16) + ")" : "";
            
            var text = "";
            if (Java.use("android.widget.TextView").class.isInstance(view)) {
                var tv = Java.cast(view, Java.use("android.widget.TextView"));
                text = " [TEXT: '" + tv.getText().toString() + "']";
            }
            
            if (text.includes("17") || text.includes("Followers")) {
                console.log(indent + className + idStr + text + " <--- TARGET FOUND");
            }

            if (Java.use("android.view.ViewGroup").class.isInstance(view)) {
                var vg = Java.cast(view, Java.use("android.view.ViewGroup"));
                for (var i = 0; i < vg.getChildCount(); i++) {
                    dumpViews(vg.getChildAt(i), indent + "  ");
                }
            }
        }
    });
});
