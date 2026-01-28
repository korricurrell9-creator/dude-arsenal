// Frida script to bypass the root detection method found in 8 Ball Pool.
// This script hooks the isDeviceRooted method and forces it to always return 'false'.

Java.perform(function() {
    console.log("[*] Starting root bypass script...");

    // Based on the code you provided, the class is likely 'io.bidmachine.DeviceInfo'.
    // If the script fails to find the class, you may need to use a tool like objection
    // to explore the application and find the correct class name.
    var targetClass = 'io.bidmachine.DeviceInfo';
    var methodName = 'isDeviceRooted';

    try {
        var DeviceInfo = Java.use(targetClass);

        DeviceInfo[methodName].implementation = function() {
            // Log that the method is being called and that we are overriding it.
            console.log("[+] Hooked " + targetClass + "." + methodName);
            
            // Force the method to return 'false', tricking the app into
            // thinking the device is not rooted.
            console.log("[+] Bypassing root check and returning 'false'.");
            return false;
        };

        console.log("[*] Hook for " + targetClass + "." + methodName + " installed successfully.");

    } catch (error) {
        console.error("[!] Failed to hook " + targetClass + "." + methodName);
        console.error("[!] Error: " + error.message);
        console.error("[!] Please verify the class name. It's possible the app uses a different class for root detection.");
    }
});
