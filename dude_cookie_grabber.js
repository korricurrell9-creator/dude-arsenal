// dude_cookie_grabber.js
Java.perform(function() {
    console.log("[*] DUDE: Cookie Grabber Active.");
    
    try {
        var CookieManager = Java.use("android.webkit.CookieManager");
        CookieManager.getCookie.overload("java.lang.String").implementation = function(url) {
            var cookie = this.getCookie(url);
            if (cookie && url.includes("tiktok.com")) {
                console.log("[COOKIE] URL: " + url);
                console.log("[COOKIE] DATA: " + cookie);
            }
            return cookie;
        };
    } catch (e) {
        console.log("[-] CookieManager hook failed: " + e.message);
    }
});
