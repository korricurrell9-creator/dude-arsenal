/*
 * DUDE's TikTok God Mode Script v2
 * Robust initialization and context handling.
 */

Java.perform(function () {
    console.log("[*] DUDE: Engaging God Mode (Waiting for App Context)...");

    // Hook Application.onCreate to ensure we have a valid context
    var Application = Java.use("android.app.Application");
    Application.onCreate.implementation = function() {
        this.onCreate(); // Call original first
        var context = this.getApplicationContext();
        console.log("[+] Application Context Initialized!");

        // 1. UI MANIPULATION: Force a Toast message to appear
        try {
            Java.scheduleOnMainThread(function() {
                var Toast = Java.use("android.widget.Toast");
                var String = Java.use("java.lang.String");
                Toast.makeText(context, String.$new("DUDE HAS ENTERED THE CHAT"), 1).show();
            });
            console.log("[+] UI: Sent 'DUDE HAS ENTERED THE CHAT' toast to screen.");
        } catch(e) {
            console.log("[-] Toast failed: " + e.message);
        }

        // 2. DATA EXTRACTION: Dump SharedPreferences
        // Doing this inside onCreate ensures the data dir is ready
        dumpPrefs();
    };

    function dumpPrefs() {
        console.log("[*] Dumping SharedPreferences list...");
        try {
            var File = Java.use("java.io.File");
            var FileInputStream = Java.use("java.io.FileInputStream");
            var InputStreamReader = Java.use("java.io.InputStreamReader");
            var BufferedReader = Java.use("java.io.BufferedReader");
            
            var prefsDir = File.$new("/data/data/com.ss.android.ugc.trill/shared_prefs/");
            
            if (prefsDir.exists()) {
                var files = prefsDir.listFiles();
                if (files) {
                    for (var i = 0; i < files.length; i++) {
                        var fileName = files[i].getName();
                        // console.log("[FILE] Prefs: " + fileName);
                        
                        // Target specific interesting files
                        if (fileName === "aweme_user.xml" || fileName === "ttnetCookieStore.xml") {
                            console.log("\n[!!!] FOUND TARGET: " + fileName);
                            try {
                                var fis = FileInputStream.$new(files[i]);
                                var isr = InputStreamReader.$new(fis);
                                var br = BufferedReader.$new(isr);
                                var line = "";
                                console.log("------ START CONTENT ------");
                                while ((line = br.readLine()) !== null) {
                                    console.log(line);
                                }
                                console.log("------ END CONTENT ------\n");
                                br.close();
                            } catch(err) {
                                console.log("[-] Failed to read " + fileName + ": " + err.message);
                            }
                        }
                    }
                } else {
                    console.log("[-] Prefs dir exists but listFiles() returned null.");
                }
            } else {
                console.log("[-] Prefs directory not found yet.");
            }
        } catch(e) {
            console.log("[-] Error dumping prefs: " + e.message);
        }
    }

    // 3. API SPYING: Hooking OkHttp3
    try {
        var Request = Java.use("okhttp3.Request");
        // Fix overload ambiguity
        Request.headers.overload().implementation = function () {
            var headers = this.headers();
            var gorgon = headers.get("X-Gorgon");
            var khronos = headers.get("X-Khronos");
            var cookie = headers.get("Cookie");

            if (gorgon) {
                console.log("\n[API] ⚔️ CAPTURED X-GORGON: " + gorgon);
            }
            if (khronos) {
                console.log("[API] ⏳ CAPTURED X-KHRONOS: " + khronos);
            }
            if (cookie) {
                 // shorten cookie for display
                console.log("[API] 🍪 CAPTURED COOKIE: " + cookie.substring(0, 40) + "...");
            }
            return headers;
        };
        console.log("[+] OkHttp3 hooks active. Waiting for traffic...");
    } catch (e) {
        console.log("[-] OkHttp3 hook failed: " + e.message);
    }

    // 4. FEED INJECTION SIMULATION (The "Custom Video" Hook)
    // We hook the method that sets the video data source.
    try {
        var VideoView = Java.use("android.widget.VideoView");
        VideoView.setVideoPath.implementation = function(path) {
            console.log("[INJECT] 💉 Intercepted Video Load: " + path);
            console.log("[INJECT] ⚠️ DUDE could replace this with: /sdcard/hacked_video.mp4");
            // To actually inject: 
            // this.setVideoPath("/sdcard/hacked_video.mp4");
            // return;
            return this.setVideoPath(path);
        };
         console.log("[+] Video Feed Injection Hooks Ready.");
    } catch(e) {
        console.log("[-] VideoView hook failed (might use ExoPlayer/custom view): " + e.message);
    }

});