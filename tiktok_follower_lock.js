/*
 * DUDE's Follower Lock
 * Relentlessly resets the text to 100k every 500ms to fight the app's refresh logic.
 */

Java.perform(function () {
    console.log("[*] DUDE: Engaging Follower Lock...");

    // We use an interval to constantly scan and reset
    setInterval(function() {
        Java.scheduleOnMainThread(function() {
            var ActivityThread = Java.use('android.app.ActivityThread');
            var currentActivityThread = ActivityThread.currentActivityThread();
            if (currentActivityThread) {
                var mActivities = currentActivityThread.mActivities.value;
                var activities = mActivities.values().toArray();
                var currentActivity = null;
                
                for(var i=0; i<activities.length; i++){
                    var record = activities[i];
                    if(!record.paused.value){
                        currentActivity = record.activity.value;
                        break;
                    }
                }

                if (currentActivity) {
                    var decorView = currentActivity.getWindow().getDecorView();
                    scanAndLock(decorView);
                }
            }
        });
    }, 500); // Fight back every half second

    function scanAndLock(view) {
        if (Java.use("android.widget.TextView").class.isInstance(view)) {
            var tv = Java.cast(view, Java.use("android.widget.TextView"));
            var text = tv.getText().toString();
            
            // If it reverted to 17, smash it back to 100k
            if (text === "17" || text === "17 ") {
                // console.log("[!] Reverting '17' back to '100.0k'");
                tv.setText(Java.use("java.lang.String").$new("100.0k"));
            }
        }

        if (Java.use("android.view.ViewGroup").class.isInstance(view)) {
            var vg = Java.cast(view, Java.use("android.view.ViewGroup"));
            for (var i = 0; i < vg.getChildCount(); i++) {
                scanAndLock(vg.getChildAt(i));
            }
        }
    }
});
