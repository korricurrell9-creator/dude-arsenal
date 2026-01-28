
Java.perform(function() {
    console.log("DUDE's login finder script injected.");

    var classesToHook = [
        "org.telegram.messenger.UserConfig",
        "org.telegram.tgnet.ConnectionsManager",
        "org.telegram.ui.LaunchActivity"
    ];

    classesToHook.forEach(function(className) {
        try {
            var clazz = Java.use(className);
            var methods = clazz.class.getDeclaredMethods();
            methods.forEach(function(method) {
                var methodName = method.getName();
                var overloads = clazz[methodName].overloads;
                overloads.forEach(function(overload) {
                    var proto = "(";
                    for (var i = 0; i < overload.argumentTypes.length; i++) {
                        proto += overload.argumentTypes[i].className + ", ";
                    }
                    if (proto.length > 1) {
                        proto = proto.substring(0, proto.length - 2);
                    }
                    proto += ")";
                    console.log("Hooking " + className + "." + methodName + proto);

                    overload.implementation = function() {
                        console.log("[DUDE] Called: " + className + "." + methodName);
                        var result = this[methodName].apply(this, arguments);
                        console.log("[DUDE] Result: " + result);
                        return result;
                    };
                });
            });
        } catch (e) {
            console.log("Could not hook " + className + ": " + e.message);
        }
    });
});
