/*
 * DUDE's TikTok Master Bypass & Sandbox Escape v3
 * 
 * Architecture:
 * - Native Hooks: Executed immediately (outside Java VM)
 * - Java Hooks: Executed within Java.perform context
 */

console.log("[*] DUDE: Injecting Payload...");

// --- NATIVE HOOKS (Outside Java Context) ---
(function() {
    try {
        // Hook 'strstr' to hide Frida artifacts from native checks
        var strstr = Module.findExportByName(null, "strstr");
        if (strstr) {
            Interceptor.attach(strstr, {
                onEnter: function(args) {
                    try {
                        if (args[1].isNull()) return;
                        var needle = args[1].readCString();
                        if (needle && needle.indexOf("frida") !== -1) {
                            // console.log("[+] FRIDA HIDE: Blocking native search for 'frida'");
                            args[1].writeUtf8String("nope");
                        }
                    } catch (e) {
                        // Silent fail to avoid log spam/instability
                    }
                }
            });
            console.log("[+] Native Hook: Frida hiding active (strstr).");
        } else {
            console.log("[-] Native Hook: 'strstr' not found (skipped).");
        }
    } catch (e) {
        console.log("[-] Native Hook Failed: " + e.message);
    }
})();

// --- JAVA HOOKS (Inside Java Context) ---
Java.perform(function () {
    console.log("[*] DUDE: Java VM attached. Engaging App Hooks...");

    // 1. SSL Pinning Bypass
    function bypassSSL() {
        try {
            var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");
            TrustManagerImpl.verifyChain.implementation = function (untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
                console.log("[+] SSL BYPASS: Trusting host -> " + host);
                return untrustedChain;
            };
            console.log("[+] Java Hook: Conscrypt SSL bypass active.");
        } catch (e) {
            console.log("[-] SSL bypass failed: " + e.message);
        }

        try {
            var X509TrustManager = Java.use("javax.net.ssl.X509TrustManager");
            var SSLContext = Java.use("javax.net.ssl.SSLContext");
            var TrustManager = Java.registerClass({
                name: "org.dude.TrustManager",
                implements: [X509TrustManager],
                methods: {
                    checkClientTrusted: function (chain, authType) {},
                    checkServerTrusted: function (chain, authType) {},
                    getAcceptedIssuers: function () { return []; }
                }
            });
            var TrustManagers = [TrustManager.$new()];
            SSLContext.init.overload("[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom").implementation = function (km, tm, sr) {
                return this.init(km, TrustManagers, sr);
            };
            // console.log("[+] Java Hook: Generic SSLContext bypass active.");
        } catch (e) {
            // console.log("[-] Generic SSLContext bypass failed: " + e.message);
        }
    }

    // 2. Root Detection Bypass
    function bypassRoot() {
        try {
            var File = Java.use("java.io.File");
            var rootPaths = [
                "/system/app/Superuser.apk", "/sbin/su", "/system/bin/su", "/system/xbin/su", 
                "/data/local/xbin/su", "/data/local/bin/su", "/system/sd/xbin/su", 
                "/system/bin/failsafe/su", "/data/local/su", "/su/bin/su"
            ];
            
            File.exists.implementation = function () {
                var path = this.getAbsolutePath();
                if (rootPaths.indexOf(path) !== -1) {
                    console.log("[+] ROOT BYPASS: Hiding " + path);
                    return false;
                }
                return this.exists();
            };

            var Runtime = Java.use("java.lang.Runtime");
            var execOverloads = Runtime.getRuntime().exec.overloads;
            execOverloads.forEach(function(overload) {
                overload.implementation = function() {
                    var cmd = arguments[0];
                    if (Array.isArray(cmd)) cmd = cmd.join(" ");
                    if (cmd && cmd.indexOf("su") !== -1) {
                        console.log("[+] ROOT BYPASS: Blocking command -> " + cmd);
                        throw Java.use("java.io.IOException").$new("Permission denied");
                    }
                    return overload.apply(this, arguments);
                };
            });
            console.log("[+] Java Hook: Root detection bypass active.");
        } catch (e) {
            console.log("[-] Root bypass failed: " + e.message);
        }
    }

    // 3. Data Interception
    function setupHooks() {
        try {
            var User = Java.use("com.ss.android.ugc.aweme.profile.model.User");
            User.getUid.implementation = function() {
                var uid = this.getUid();
                console.log("[DATA] Intercepted UID: " + uid);
                return uid;
            };
            User.getNickname.implementation = function() {
                var name = this.getNickname();
                console.log("[DATA] Intercepted Nickname: " + name);
                return name;
            };
            console.log("[+] Java Hook: User Data Interception active.");
        } catch (e) {
            console.log("[-] Data hooks failed (class not found/obfuscated): " + e.message);
        }
    }

    bypassSSL();
    bypassRoot();
    setupHooks();

    console.log("[*] DUDE: Initialization Complete. Sandbox breached.");
});