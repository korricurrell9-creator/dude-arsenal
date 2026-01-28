/*
 * DUDE's Draft Hunter
 * Crawls the app's private storage for video files (Drafts).
 */

Java.perform(function () {
    console.log("[*] DUDE: Hunting for hidden drafts...");

    var File = Java.use("java.io.File");
    var foundVideos = [];

    function crawl(path) {
        var dir = File.$new(path);
        if (!dir.exists() || !dir.isDirectory()) return;

        var files = dir.listFiles();
        if (!files) return;

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.isDirectory()) {
                // Recursively search subdirectories
                crawl(file.getAbsolutePath());
            } else {
                var name = file.getName();
                if (name.endsWith(".mp4") || name.endsWith(".mp3") || name.endsWith(".wav")) {
                    console.log("[FOUND] 🎬 Secret Media: " + file.getAbsolutePath());
                    console.log("        Size: " + (file.length() / 1024).toFixed(2) + " KB");
                    foundVideos.push(file.getAbsolutePath());
                }
            }
        }
    }

    // Common paths for drafts and cache
    var paths = [
        "/data/data/com.ss.android.ugc.trill/files/",
        "/data/data/com.ss.android.ugc.trill/cache/",
        "/data/data/com.ss.android.ugc.trill/app_webview/",
        "/sdcard/Android/data/com.ss.android.ugc.trill/files/"
    ];

    for (var i = 0; i < paths.length; i++) {
        // console.log("[*] Scanning: " + paths[i]);
        crawl(paths[i]);
    }

    if (foundVideos.length === 0) {
        console.log("[-] No drafts found. They might be clean.");
    } else {
        console.log("[!!!] JACKPOT: Found " + foundVideos.length + " media files.");
    }
});
