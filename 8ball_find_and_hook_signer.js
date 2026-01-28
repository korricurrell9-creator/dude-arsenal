console.log("[*] SignerEngine Hunter script loaded.");

Java.perform(function() {
    console.log("[*] In Java.perform(). Starting class enumeration...");
    Java.enumerateLoadedClasses({
        onMatch: function(className) {
            try {
                var clazz = Java.use(className);
                
                // We can't get interfaces of an interface, so skip them
                if (clazz.class.isInterface()) {
                    return;
                }
                
                var interfaces = clazz.class.getInterfaces();
                if (!interfaces) {
                    return;
                }

                for (var i = 0; i < interfaces.length; i++) {
                    // Looking for any interface that has a 'sign' method
                    if (interfaces[i].getName().endsWith('SignerEngine')) {
                        console.log(`[+] Found potential SignerEngine implementation: ${className}`);
                        
                        // Let's hook the sign method
                        var signer = Java.use(className);
                        signer.sign.implementation = function(data) {
                            console.log(`[+] Intercepted call to ${className}.sign().`);
                            console.log("[+] Data to be signed (first 32 bytes):");
                            console.log(hexdump(data, { length: 32 }));
                            
                            // Call the original method to get the signature
                            var signature = this.sign(data);
                            
                            console.log("[+] Original signature (first 32 bytes):");
                            console.log(hexdump(signature, { length: 32 }));
                            
                            // For now, we return the original signature.
                            // In the future, we could return a fake one.
                            return signature;
                        };
                        
                        console.log(`[+] Hooked ${className}.sign() successfully.`);
                    }
                }
            } catch (e) {
                // This will fail for many classes, which is expected.
                // console.error(`[!] Error processing class ${className}: ${e.message}`);
            }
        },
        onComplete: function() {
            console.log('[*] Class enumeration complete. Waiting for sign() to be called...');
        }
    });
});
