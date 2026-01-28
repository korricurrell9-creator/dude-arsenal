/*
 * DUDE's Jailbreak Attempt
 * Goal: Prove actual sandbox escape by accessing resources outside the app's UID/SELinux context.
 */

Java.perform(function () {
    console.log("[*] DUDE: Testing Sandbox Walls...");

    // 1. IDENTITY CHECK: Who are we really?
    try {
        var Process = Java.use("android.os.Process");
        var myUid = Process.myUid();
        console.log("[ID] Current UID: " + myUid);
        
        // Try to run 'id' command
        var Runtime = Java.use("java.lang.Runtime");
        var process = Runtime.getRuntime().exec("id");
        var reader = Java.use("java.io.BufferedReader").$new(
            Java.use("java.io.InputStreamReader").$new(process.getInputStream())
        );
        var line = reader.readLine();
        console.log("[SHELL] 'id' output: " + line);
        
        // Check SELinux context if possible via 'ls -Z' or 'id'
        var process2 = Runtime.getRuntime().exec("ls -Z /data/data/com.ss.android.ugc.trill/");
        var reader2 = Java.use("java.io.BufferedReader").$new(
            Java.use("java.io.InputStreamReader").$new(process2.getInputStream())
        );
        var context = reader2.readLine();
        console.log("[SELINUX] App Context: " + context);
        
    } catch(e) {
        console.log("[-] Identity check failed: " + e.message);
    }

    // 2. BREAKOUT ATTEMPT: Read ANOTHER app's data
    // Target: com.android.settings (System app)
    try {
        var File = Java.use("java.io.File");
        var targetPath = "/data/data/com.android.settings/shared_prefs/";
        var targetDir = File.$new(targetPath);
        
        console.log("[ATTEMPT] Trying to list: " + targetPath);
        if (targetDir.exists()) {
             var files = targetDir.listFiles();
             if (files) {
                 console.log("[!!!] ESCAPE SUCCESS: Read neighbor's data! Files found: " + files.length);
             } else {
                 console.log("[-] BLOCKED: exists() is true but listFiles() returned null (Permission Denied).");
             }
        } else {
            console.log("[-] BLOCKED: Cannot see directory (Hidden by Sandbox/SELinux).");
        }
    } catch(e) {
        console.log("[-] Read attempt threw error: " + e.message);
    }

    // 3. WRITE ATTEMPT: Write to System or Tmp
    try {
        var FileWriter = Java.use("java.io.FileWriter");
        var writePath = "/data/local/tmp/dude_escape.txt";
        console.log("[ATTEMPT] Trying to write to: " + writePath);
        
        var writer = FileWriter.$new(writePath);
        writer.write("DUDE WAS HERE - SANDBOX BROKEN");
        writer.close();
        console.log("[!!!] ESCAPE SUCCESS: Wrote to /data/local/tmp/!");
    } catch(e) {
        console.log("[-] Write attempt failed: " + e.message);
    }

});
