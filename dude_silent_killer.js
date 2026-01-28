/*
 * DUDE's Silent Killer Bypass v2
 *
 * This script is designed for surgical precision against apps that detect hooks and logging.
 *
 * Phase 2: Native & Java Kill Switch Suppression
 * - Hooks System.exit() (Java)
 * - Hooks Process.killProcess() (Java)
 * - Hooks kill() (Native)
 * - Hooks abort() (Native)
 * - Contains ZERO logging to remain undetected.
 */

// --- Native Kill Switch Suppression ---
// These are hooked immediately at the C level.

try {
    const killPtr = Module.findExportByName(null, "kill");
    Interceptor.attach(killPtr, {
        onEnter: function(args) {
            // int kill(pid_t pid, int sig);
            const pid = args[0].toInt32();
            if (pid === Process.id) {
                // Block attempts to kill the current process. No logging.
                // By replacing the pid with an invalid one (0), the call will fail.
                args[0] = ptr(0);
            }
        }
    });
} catch (e) {
    // Fails silently.
}

try {
    const abortPtr = Module.findExportByName(null, "abort");
    // Replace the abort function entirely to prevent it from ever executing.
    Interceptor.replace(abortPtr, new NativeCallback(() => {
        // Do nothing. Silently ignore abort.
    }, 'void', []));
} catch (e) {
    // Fails silently.
}


if (Java.available) {
    Java.perform(function () {
        // --- Java Kill Switch Suppression ---
        // These must be in place before the app's own code runs.

        try {
            const System = Java.use("java.lang.System");
            System.exit.implementation = function (code) {
                // Silently block the exit. No logging.
            };
        } catch (e) {
            // Fails silently if the class/method isn't found.
        }

        try {
            const Process = Java.use("android.os.Process");
            Process.killProcess.implementation = function (pid) {
                // Silently block the process kill. No logging.
            };
        } catch (e) {
            // Fails silently if the class/method isn't found.
        }
    });
}
