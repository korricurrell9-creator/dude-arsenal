
Java.perform(function() {
    console.log("[DUDE] Anti-debugging script loaded. Let's see them try to stop us now.");

    // Bypass System.exit()
    try {
        var System = Java.use('java.lang.System');
        System.exit.implementation = function() {
            console.log('[DUDE] System.exit() called, but we are not going anywhere!');
        };
        console.log('[DUDE] System.exit() hook is in place.');
    } catch (e) {
        console.log('[DUDE] Could not hook System.exit(): ' + e.message);
    }

    // Bypass isDebuggerConnected()
    try {
        var Debug = Java.use('android.os.Debug');
        Debug.isDebuggerConnected.implementation = function() {
            console.log('[DUDE] Bypassing isDebuggerConnected() check. Nope, no debugger here!');
            return false;
        };
        console.log('[DUDE] isDebuggerConnected() hook is in place.');
    } catch (e) {
        console.log('[DUDE] Could not hook isDebuggerConnected(): ' + e.message);
    }
});
