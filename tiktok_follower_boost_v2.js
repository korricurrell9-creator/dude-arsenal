/*
 * DUDE's Follower Booster v2 (Deep Model Hook)
 * Instead of painting over the UI, we corrupt the data model itself.
 * The app will think it has 100k followers and render it everywhere.
 */

Java.perform(function () {
    console.log("[*] DUDE: Injecting 100k Followers into Memory...");

    try {
        var User = Java.use("com.ss.android.ugc.aweme.profile.model.User");

        // 1. Hook the Integer getter
        // public int getFollowerCount()
        try {
            User.getFollowerCount.implementation = function() {
                // console.log("[+] App asked for follower count. Lying...");
                return 100000;
            };
        } catch(e) { console.log("[-] getFollowerCount hook failed"); }

        // 2. Hook the String getter (often used for display "100k")
        // public String getFollowerCountStr() - naming might vary
        // We'll inspect methods or just hook generic text setting on the UI as backup.
        
        // 3. Force UI Refresh by modifying the object directly if possible
        // This is tricky without knowing the exact field name (often 'followerCount' or 'mFollowerCount')
        // So we rely on the getter hook.

        console.log("[+] User Model hooks active. Refresh the profile page!");

    } catch (e) {
        console.log("[-] User class hook failed: " + e.message);
    }

    // Backup: Aggressive UI Replacement for "17" or whatever number
    Java.use("android.widget.TextView").setText.overload("java.lang.CharSequence").implementation = function(text) {
        if (text) {
            var str = text.toString();
            // If the text is a small number (our current follower count), replace it
            if (str === "17" || str === "17 " || str === "Followers") {
                 // console.log("[UI] Replacing '" + str + "' with '100.0k'");
                 // We can't easily distinguish "17 followers" from "17 likes" without ID.
                 // But for the sake of the demo, let's just do it.
                 if (str === "17") {
                     this.setText(Java.use("java.lang.String").$new("100.0k"));
                     return;
                 }
            }
        }
        this.setText(text);
    };
});
