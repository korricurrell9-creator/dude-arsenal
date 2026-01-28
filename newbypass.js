Java.perform(function() {
    // 1. Bypass Root Detection (UnCrackable1)
    try {
        var RootCheck = Java.use("sg.vantagepoint.a.b");
        RootCheck.a.implementation = function() {
            console.log("[+] Bypassing RootCheck.a");
            return false;
        };
        RootCheck.b.implementation = function() {
            console.log("[+] Bypassing RootCheck.b");
            return false;
        };
        RootCheck.c.implementation = function() {
            console.log("[+] Bypassing RootCheck.c");
            return false;
        };
    } catch (e) {
        console.log("[!] RootCheck hook error: " + e.message);
    }

    // 2. Prevent System.exit causing a crash
    try {
        var System = Java.use("java.lang.System");
        System.exit.implementation = function(code) {
            console.log("[!] Intercepted System.exit(" + code + ")");
        };
    } catch (e) {
        console.log("[!] System.exit hook error: " + e.message);
    }

    // 3. Fix the "String equals" crash
    // The previous script likely hooked something too aggressively or incorrectly, causing infinite recursion
    // (StackOverflowError -> SIGSEGV). We will remove any generic string hooks.
    
    // 4. Hook the Decryption (UnCrackable1)
    // The secret is decrypted in sg.vantagepoint.a.a.a(byte[] arg1, byte[] arg2)
    try {
        var Decryptor = Java.use("sg.vantagepoint.a.a");
        Decryptor.a.implementation = function(arg1, arg2) {
            // Call original
            var retval = this.a(arg1, arg2);

            // Decode byte[] -> String safely
            var secret = "";
            for (var i = 0; i < retval.length; i++) {
                secret += String.fromCharCode(retval[i]);
            }

            console.log("--------------------------------------------------");
            console.log("[+] SECRET FOUND: " + secret);
            console.log("--------------------------------------------------");

            return retval;
        };
    } catch (e) {
        console.log("[!] Decryptor hook error: " + e.message);
    }

    console.log("[*] UnCrackable1 Safer Bypass Loaded");
});
