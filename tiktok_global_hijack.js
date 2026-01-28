/*
 * DUDE's Global UI Hijacker
 * Searches the entire heap for EditTexts and Buttons to force the bio change.
 */

Java.perform(function () {
    console.log("[*] DUDE: Global UI Hijack started...");

    // 1. Target all EditTexts
    Java.choose("android.widget.EditText", {
        onMatch: function (instance) {
            console.log("[+] Found EditText instance!");
            Java.scheduleOnMainThread(function() {
                instance.setText(Java.use("java.lang.String").$new("HACKED BY DUDE 🤖"));
                console.log("[!] Set text for EditText");
            });
        },
        onComplete: function () {
            console.log("[*] EditText search complete.");
        }
    });

    // 2. Target all TextViews that might be "Save" buttons
    Java.choose("android.widget.TextView", {
        onMatch: function (instance) {
            var text = instance.getText().toString();
            if (text === "Save" || text === "Done" || text === "Confirm" || text === "Save bio") {
                console.log("[+] Found '" + text + "' button instance!");
                Java.scheduleOnMainThread(function() {
                    instance.performClick();
                    console.log("[!] Clicked " + text);
                });
            }
        },
        onComplete: function () {
            console.log("[*] TextView search complete.");
        }
    });
});
