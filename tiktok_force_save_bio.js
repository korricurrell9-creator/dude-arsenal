/*
 * DUDE's Force Save Bio Script
 * Targets the UI directly to input the text and trigger the save button.
 */

Java.perform(function () {
    console.log("[*] DUDE: Force Save Bio initiated...");

    Java.scheduleOnMainThread(function() {
        var ActivityThread = Java.use('android.app.ActivityThread');
        var currentActivity = null;
        
        // Find the active activity
        var activities = ActivityThread.sCurrentActivityThread.get().mActivities.values().toArray();
        for (var i = 0; i < activities.length; i++) {
            var activityRecord = activities[i];
            var activity = activityRecord.activity.get();
            if (activity) {
                currentActivity = activity;
                console.log("[+] Found Active Activity: " + currentActivity.getClass().getName());
            }
        }

        if (currentActivity) {
            // 1. Find the EditText for bio
            var views = currentActivity.getWindow().getDecorView().findViewsWithText; // This is a bit complex in raw Java
            
            // Let's try a different approach: Iterate all views
            var decorView = currentActivity.getWindow().getDecorView();
            var ViewGroup = Java.use("android.view.ViewGroup");
            var EditText = Java.use("android.widget.EditText");
            var TextView = Java.use("android.widget.TextView");

            function findAndAction(view) {
                if (EditText.class.isInstance(view)) {
                    var et = Java.cast(view, EditText);
                    console.log("[+] Found EditText! Setting text to 'HACKED BY DUDE 🤖'...");
                    et.setText(Java.use("java.lang.String").$new("HACKED BY DUDE 🤖"));
                }
                
                if (TextView.class.isInstance(view)) {
                    var tv = Java.cast(view, TextView);
                    var text = tv.getText().toString();
                    if (text === "Save" || text === "Done" || text === "Confirm") {
                        console.log("[+] Found '" + text + "' button! Triggering click...");
                        tv.performClick();
                    }
                }

                if (ViewGroup.class.isInstance(view)) {
                    var group = Java.cast(view, ViewGroup);
                    for (var i = 0; i < group.getChildCount(); i++) {
                        findAndAction(group.getChildAt(i));
                    }
                }
            }

            findAndAction(decorView);
        } else {
            console.log("[-] No active activity found. Make sure the app is in the foreground!");
        }
    });
});
