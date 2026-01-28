/*
 * DUDE's Persistent Follower Lock (Interceptor Mode)
 * Instead of scanning the screen, we hook the TextView.setText() method.
 * Any time the app tries to write "17", we force it to write "100.0k".
 * This is faster, cleaner, and un-revertable by the app.
 */

Java.perform(function () {
    console.log("[*] DUDE: Persistent Follower Lock engaged...");

    var TextView = Java.use("android.widget.TextView");
    var String = Java.use("java.lang.String");

    // Hook setText(CharSequence)
    TextView.setText.overload("java.lang.CharSequence").implementation = function (text) {
        if (text) {
            var str = text.toString();
            // Check for the specific follower count "17" or common variations
            if (str === "17" || str === "17 " || str === "Followers") {
                 // console.log("[LOCK] App tried to set '" + str + "'. Overriding to 100k.");
                 if (str === "17") {
                     // The lock: specific replacement
                     this.setText(String.$new("100.0k"));
                     return; 
                 }
            }
        }
        // Proceed with original for everything else
        this.setText(text);
    };

    // Hook setText(CharSequence, BufferType) - generic overload often used internally
    TextView.setText.overload("java.lang.CharSequence", "android.widget.TextView$BufferType").implementation = function (text, type) {
        if (text) {
            var str = text.toString();
            if (str === "17" || str === "17 ") {
                 // console.log("[LOCK] App tried to set '" + str + "' (BufferType). Overriding.");
                 // We call the *other* overload or just change the arg
                 // Changing arg is safer to avoid recursion loops if we call this.setText again
                 var newText = String.$new("100.0k");
                 this.setText(newText, type);
                 return;
            }
        }
        this.setText(text, type);
    };

    console.log("[+] Lock Active. Refresh the page as much as you want.");
});
