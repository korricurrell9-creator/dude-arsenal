/*
    Frida Universal SSL Pinning Bypass & TikTok User Hooking Script
*/

Java.perform(function () {
    console.log("[*] Starting V2 SCRIPT..."); // <-- LOOK FOR THIS NEW MESSAGE

    // --- TrustManager (generic) ---
    try {
        var X509TrustManager = Java.use("javax.net.ssl.X509TrustManager");
        var SSLContext = Java.use("javax.net.ssl.SSLContext");

        var TrustManager = Java.registerClass({
            name: "org.korri.TrustManager",
            implements: [X509TrustManager],
            methods: {
                checkClientTrusted: function (chain, authType) {},
                checkServerTrusted: function (chain, authType) {},
                getAcceptedIssuers: function () { return []; }
            }
        });

        var TrustManagers = [TrustManager.$new()];
        SSLContext.init.overload(
            "[Ljavax.net.ssl.KeyManager;",
            "[Ljavax.net.ssl.TrustManager;",
            "java.security.SecureRandom"
        ).implementation = function (km, tm, sr) {
            console.log("[*] SSLContext.init() hooked");
            return this.init(km, TrustManagers, sr);
        };
        console.log("[+] Generic TrustManager hook installed");
    } catch (e) {
        console.log("[-] Generic TrustManager hook failed: " + e);
    }

    // --- Conscrypt (VERY IMPORTANT for TikTok) ---
    try {
        var TrustManagerImpl = Java.use(
            "com.android.org.conscrypt.TrustManagerImpl"
        );
        TrustManagerImpl.verifyChain.implementation = function (
            untrustedChain,
            trustAnchorChain,
            host,
            clientAuth,
            ocspData,
            tlsSctData
        ) {
            console.log("[+] Conscrypt verifyChain bypassed for host: " + host);
            return untrustedChain;
        };
        console.log("[+] Conscrypt hook installed");
    } catch (e) {
        console.log("[-] Conscrypt hook failed: " + e);
    }

    console.log("[*] SSL pinning bypass hooks installed.");

    // --- TikTok User Model Hooking ---
    try {
        // Hook the User class we found in the decompiled code
        var User = Java.use("com.ss.android.ugc.aweme.profile.model.User");

        // Hook the getUid method
        User.getUid.implementation = function() {
            var uid = this.getUid();
            console.log("[+] Intercepted User.getUid(): " + uid);
            return uid;
        };

        // Hook the getNickname method
        User.getNickname.implementation = function() {
            var nickname = this.getNickname();
            console.log("[+] Intercepted User.getNickname(): " + nickname);
            return nickname;
        };

        // Hook the getSecUid method
        User.getSecUid.implementation = function() {
            var secUid = this.getSecUid();
            console.log("[+] Intercepted User.getSecUid(): " + secUid);
            return secUid;
        };

        console.log("[*] com.ss.android.ugc.aweme.profile.model.User hooks installed successfully!");

    } catch (e) {
        console.log("[-] Failed to hook User class: " + e.message);
    }
});