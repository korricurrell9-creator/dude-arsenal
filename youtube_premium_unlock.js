/*
 * DUDE's YouTube Premium Unlocker - VERSION 6.0 (ULTIMATE ARMOR)
 * Designed for Android 15 / LineageOS / non-GMS tablets.
 */

console.log("[*] DUDE: Initializing YouTube Premium Unlocker v6.0...");

// --- 1. GHOST PROTOCOL (Enhanced Native Invisibility) ---
try {
    var libc = Process.findModuleByName("libc.so");
    if (libc) {
        var strstrPtr = libc.findExportByName("strstr");
        if (strstrPtr) {
            Interceptor.attach(strstrPtr, {
                onEnter: function(args) {
                    try {
                        if (args[1].isNull()) return;
                        var needle = args[1].readCString();
                        if (needle && (needle.indexOf("frida") !== -1 || needle.indexOf("gum-js-loop") !== -1 || needle.indexOf("gdb") !== -1)) {
                            args[1].writeUtf8String("nonexistent_symbol");
                        }
                    } catch (e) {}
                }
            });
            console.log("[+] GHOST: Native invisibility (strstr) active.");
        }
    }
} catch (e) {}

Java.perform(function () {
    console.log("[*] DUDE: Java VM ready. Deploying Ultimate Armor...");

    const Log = Java.use("android.util.Log");
    const Exception = Java.use("java.lang.Exception");
    function printStack(msg) {
        console.log(msg + "\n" + Log.getStackTraceString(Exception.$new()));
    }

    // 2. Identity Cloaking (Build & SystemProp Spoofing)
    function spoofIdentity() {
        try {
            var Build = Java.use("android.os.Build");
            var fields = {
                "MODEL": "SM-S928B",
                "MANUFACTURER": "samsung",
                "BRAND": "samsung",
                "PRODUCT": "eureka",
                "DEVICE": "eureka",
                "HARDWARE": "qcom",
                "FINGERPRINT": "samsung/eureka/eureka:14/UP1A.231005.007/S928BXXU1AOA1:user/release-keys",
                "TYPE": "user",
                "TAGS": "release-keys",
                "HOST": "buildhost",
                "USER": "builder"
            };
            
            for (var key in fields) {
                try {
                    var field = Build.class.getDeclaredField(key);
                    field.setAccessible(true);
                    field.set(null, fields[key]);
                } catch (e) {
                    try { Build[key].value = fields[key]; } catch(e2) {}
                }
            }

            var VERSION = Java.use("android.os.Build$VERSION");
            try { VERSION.SDK_INT.value = 34; } catch(e) {}
            try { VERSION.RELEASE.value = "14"; } catch(e) {}

            var SystemProperties = Java.use("android.os.SystemProperties");
            var oldGet = SystemProperties.get.overload('java.lang.String');
            oldGet.implementation = function (key) {
                if (key.indexOf("ro.product.model") !== -1) return "SM-S928B";
                if (key.indexOf("ro.product.brand") !== -1) return "samsung";
                if (key.indexOf("ro.product.manufacturer") !== -1) return "samsung";
                if (key.indexOf("ro.build.version.release") !== -1) return "14";
                if (key.indexOf("ro.build.version.sdk") !== -1) return "34";
                if (key.indexOf("ro.build.fingerprint") !== -1) return "samsung/eureka/eureka:14/UP1A.231005.007/S928BXXU1AOA1:user/release-keys";
                if (key.indexOf("ro.build.tags") !== -1) return "release-keys";
                if (key.indexOf("ro.debuggable") !== -1) return "0";
                if (key.indexOf("ro.secure") !== -1) return "1";
                return oldGet.call(this, key);
            };

            console.log("[+] IDENTITY: Cloaked as Galaxy S24 Ultra.");
        } catch (e) {
            console.log("[-] Identity spoofing failed.");
        }
    }

    // 6. GMS (Google Play Services) Deep Mock
    function bypassGMS() {
        const gmsClasses = [
            'com.google.android.gms.common.GoogleApiAvailability',
            'com.google.android.gms.common.GooglePlayServicesUtil',
            'com.google.android.gms.common.GooglePlayServicesUtilLight'
        ];

        gmsClasses.forEach(function(clsName) {
            try {
                var cls = Java.use(clsName);
                var hook = function() { return 0; };
                
                try { cls.isGooglePlayServicesAvailable.overload('android.content.Context').implementation = hook; } catch(e) {}
                try { cls.isGooglePlayServicesAvailable.overload('android.content.Context', 'int').implementation = hook; } catch(e) {}
                
                if (clsName.indexOf('GoogleApiAvailability') !== -1) {
                    try {
                        cls.getInstance.implementation = function() {
                            return cls.$new();
                        };
                    } catch(e) {}

                    try {
                        cls.getErrorDialog.overload('android.app.Activity', 'int', 'int').implementation = function(a, e, r) {
                            console.log("[!] DUDE: Suppressed GMS Error Dialog (Code: " + e + ")");
                            return null; 
                        };
                        cls.getErrorDialog.overload('android.app.Activity', 'int', 'int', 'android.content.DialogInterface$OnCancelListener').implementation = function(a, e, r, l) {
                            console.log("[!] DUDE: Suppressed GMS Error Dialog w/ Listener (Code: " + e + ")");
                            return null; 
                        };
                    } catch(e) {}
                    
                    try {
                        cls.showErrorDialogFragment.implementation = function() {
                            console.log("[!] DUDE: Suppressed GMS Error Dialog Fragment");
                            return true;
                        };
                    } catch(e) {}
                }
            } catch (e) {
                console.log("[*] DUDE: Could not hook " + clsName + ": " + e);
            }
        });
        console.log("[+] GMS Deep Mock environment active.");
    }

    // 8. Package Phantom (Signature & Version Spoofing)
    function mockPackages() {
        try {
            var PackageManager = Java.use("android.app.ApplicationPackageManager");
            var PackageInfo = Java.use("android.content.pm.PackageInfo");
            var ApplicationInfo = Java.use("android.content.pm.ApplicationInfo");
            var Signature = Java.use("android.content.pm.Signature");

            var fakePackages = ["com.google.android.gms", "com.android.vending", "com.google.android.gsf"];
            var googleSigHex = "308202733082015ba0030201020204439c285d300d06092a864886f70d01010b05003037313530330603550403132c416e64726f696420506c6174666f726d206d61726b6574206b6579732028632920476f66676c6520496e63";

            var getPackageInfoHook = function(name, flags) {
                if (fakePackages.indexOf(name) !== -1) {
                    console.log("[+] PHANTOM: Providing fake info for " + name + " (flags: " + flags + ")");
                    var info = PackageInfo.$new();
                    info.packageName.value = name;
                    info.versionCode.value = 250932024;
                    info.versionName.value = "25.09.32";
                    
                    if ((flags & 64) !== 0) { // GET_SIGNATURES
                        info.signatures.value = Java.array('android.content.pm.Signature', [Signature.$new(googleSigHex)]);
                    }
                    return info;
                }
                return this.getPackageInfo(name, flags);
            };

            PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = getPackageInfoHook;
            
            try {
                // Android 13+ PackageInfoFlags overload
                PackageManager.getPackageInfo.overload('java.lang.String', 'android.content.pm.PackageManager$PackageInfoFlags').implementation = function(name, flags) {
                    return getPackageInfoHook.call(this, name, 0);
                };
            } catch(e) {}

            PackageManager.getApplicationInfo.overload('java.lang.String', 'int').implementation = function(name, flags) {
                if (fakePackages.indexOf(name) !== -1) {
                    var info = ApplicationInfo.$new();
                    info.packageName.value = name;
                    info.enabled.value = true;
                    info.flags.value = 1; // SYSTEM_APP
                    info.targetSdkVersion.value = 34;
                    return info;
                }
                return this.getApplicationInfo(name, flags);
            };

            console.log("[+] PACKAGE PHANTOM active.");
        } catch (e) {
            console.log("[-] Package Phantom failed.");
        }
    }

    // 9. Anti-Exit & UI Sniffer (Crushing the "Not Compatible" screen)
    function debugDiagnostics() {
        try {
            var System = Java.use("java.lang.System");
            System.exit.implementation = function(status) {
                printStack("[!] DUDE: Blocked System.exit(" + status + ")");
                return;
            };

            var Activity = Java.use("android.app.Activity");
            Activity.finish.overload().implementation = function() {
                printStack("[!] DUDE: Blocked Activity.finish()");
                // return; // Let it finish if needed, but log it
                this.finish();
            };

            var TextView = Java.use("android.widget.TextView");
            TextView.setText.overload('java.lang.CharSequence').implementation = function(text) {
                if (text) {
                    var s = text.toString();
                    if (s.toLowerCase().indexOf("support") !== -1 || s.toLowerCase().indexOf("compat") !== -1 || s.toLowerCase().indexOf("google") !== -1) {
                        console.log("[SNIFFER] Potential message: " + s);
                        // If it's the "Device not compatible" message, we might want to hide it
                        if (s.indexOf("Device not compatible") !== -1 || s.indexOf("Google Play services") !== -1) {
                            text = Java.use("java.lang.String").$new("DUDE: LOADING BYPASS...");
                        }
                    }
                }
                return this.setText(text);
            };

            var Dialog = Java.use("android.app.Dialog");
            Dialog.show.implementation = function() {
                console.log("[!] DUDE: Intercepted Dialog.show()");
                // return; // Suppress all dialogs? High risk.
                this.show();
            };

            console.log("[+] DIAGNOSTICS & UI OVERRIDE active.");
        } catch (e) {}
    }

    // 3. Force Premium Status
    function unlockPremium() {
        try {
            var UserContext = Java.use('com.google.android.apps.youtube.app.common.user.UserContext');
            UserContext.isPremium.implementation = function() { return true; };
            console.log("[+] Premium logic injected.");
        } catch (e) {}
    }

    // 10. WebView Sandbox Decimation (Removing iframe restrictions)
    function liberateWebView() {
        try {
            var WebView = Java.use("android.webkit.WebView");
            var WebSettings = Java.use("android.webkit.WebSettings");

            // Enable Webview debugging for deep inspection
            try { WebView.setWebContentsDebuggingEnabled(true); } catch(e) {}

            // Hook WebSettings to force-enable all features
            WebSettings.setJavaScriptEnabled.implementation = function(b) {
                return this.setJavaScriptEnabled(true);
            };
            WebSettings.setDomStorageEnabled.implementation = function(b) {
                return this.setDomStorageEnabled(true);
            };
            WebSettings.setAllowFileAccess.implementation = function(b) {
                return this.setAllowFileAccess(true);
            };

            console.log("[+] WEBVIEW: Sandbox logic decimated.");
        } catch (e) {}
    }

    // Execute
    spoofIdentity();
    bypassGMS();
    mockPackages();
    unlockPremium();
    debugDiagnostics();
    liberateWebView();
    showConfirmation();

    console.log("[*] DUDE: YouTube is now FULLY UNLEASHED (v6.0).");
});
