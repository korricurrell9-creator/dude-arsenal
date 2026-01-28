/*
 * DUDE's Database Scanner
 * Locates the internal SQLite databases containing DMs and Chat Logs.
 */

Java.perform(function () {
    console.log("[*] DUDE: Scanning for Secrets Databases...");

    var File = Java.use("java.io.File");
    var dbPath = "/data/data/com.ss.android.ugc.trill/databases/";
    var dir = File.$new(dbPath);

    if (dir.exists() && dir.isDirectory()) {
        var files = dir.listFiles();
        if (files) {
            console.log("[+] Database Directory Accessible!");
            for (var i = 0; i < files.length; i++) {
                var name = files[i].getName();
                if (name.includes("im") || name.includes("msg") || name.includes("db")) {
                    console.log("[DB] Found: " + name);
                    console.log("     Size: " + (files[i].length() / 1024).toFixed(2) + " KB");
                }
            }
        } else {
            console.log("[-] listFiles() returned null.");
        }
    } else {
        console.log("[-] Database directory not found or inaccessible.");
    }
});
