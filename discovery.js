Java.perform(function() {
    console.log("[*] Enumerating classes to find MainActivity...");
    var found = false;
    Java.enumerateLoadedClasses({
        onMatch: function(className) {
            if (className.includes("MainActivity")) {
                console.log("[+] Found candidate: " + className);
                found = true;
            }
        },
        onComplete: function() {
            if (!found) {
                console.log("[-] No class with 'MainActivity' in the name found loaded yet.");
                console.log("    (The class might not be loaded until the activity starts)");
            } else {
                console.log("[*] Search complete. Try using one of the found class names.");
            }
        }
    });
});