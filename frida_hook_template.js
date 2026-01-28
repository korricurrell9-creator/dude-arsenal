// frida_hook_template.js

Java.perform(function () {
    // 1. Define the target class name
    // Replace 'com.example.target.ClassName' with the actual package and class
    var className = 'com.example.target.ClassName';
    
    // 2. Define the target method name
    var methodName = 'targetMethodName';

    try {
        var TargetClass = Java.use(className);

        // 3. Overload the method implementation
        // Note: If the method has overloads (same name, different arguments),
        // you may need to specify arguments using .overload('int', 'java.lang.String')
        TargetClass[methodName].implementation = function () {
            
            // Log that the method was called
            console.log('[*] ' + className + '.' + methodName + ' called');

            // Access arguments via the 'arguments' array
            for (var i = 0; i < arguments.length; i++) {
                console.log('    Arg ' + i + ': ' + arguments[i]);
            }

            // Call the original implementation to preserve app functionality
            var result = this[methodName].apply(this, arguments);

            // Inspect the return value
            console.log('    Return: ' + result);

            return result;
        };

        console.log('[+] Hooked ' + className + '.' + methodName);

    } catch (e) {
        console.error('[!] Error hooking class: ' + e.message);
    }
});
