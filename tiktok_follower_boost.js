/*
 * DUDE's Follower Booster (UI Hijack)
 * Changes the displayed follower count to 100k.
 * Note: This is client-side only (Visual Flex).
 */

Java.perform(function () {
    console.log("[*] DUDE: Boosting Follower Count to 100k...");

    var targetCount = "17"; // We know this from the XML dump
    var newCount = "100.0k";

    Java.choose("android.widget.TextView", {
        onMatch: function (instance) {
            try {
                var text = instance.getText().toString();
                // Match exact count or common labels
                if (text === targetCount || text === "Followers") {
                    console.log("[+] Found Follower View (Text: " + text + ")");
                    Java.scheduleOnMainThread(function() {
                        if (text === targetCount) {
                            instance.setText(Java.use("java.lang.String").$new(newCount));
                            console.log("[!!!] BOOST APPLIED: " + targetCount + " -> " + newCount);
                        }
                    });
                }
            } catch (e) {}
        },
        onComplete: function () {
            console.log("[*] Scan complete.");
        }
    });
});
