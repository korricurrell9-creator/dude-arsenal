// Frida script v5 for 8 Ball Pool
// A targeted bypass based on the provided EventsReceiver source code.

Java.perform(function() {
    console.log("[*] Starting targeted bypass script (v5)...");
    
    var targetClass = 'com.miniclip.events.EventsReceiver';
    var targetMethod = 'onReceive';

    try {
        var EventsReceiver = Java.use(targetClass);

        // Hook the onReceive method. This method is the entry point for all
        // security event reports (Frida, Root, Magisk, etc.).
        EventsReceiver[targetMethod].implementation = function(context, intent) {
            // The original code processes the intent and sends a report to a native library,
            // which then likely terminates the app. We will "swallow" the event by doing nothing.
            
            var action = intent.getAction();
            console.log("[+] Intercepted and BLOCKED a security event: '" + action + "'");
            console.log("[+] The application will no longer be notified of this detection.");
            
            // By not calling the original method and simply returning, the report is stopped here.
        };

        console.log("[*] Hook for " + targetClass + "." + targetMethod + " installed successfully.");
        console.log("[*] All security events should now be neutralized.");

    } catch (error) {
        console.error("[!] Failed to hook " + targetClass + "." + targetMethod + ": " + error.message);
    }
});
