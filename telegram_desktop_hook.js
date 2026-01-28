// Frida script to hook into Telegram Desktop's SSL traffic

// Find the SSL_write function, which is commonly used for sending encrypted data.
// We are not targeting a specific library, so Frida will search all loaded modules.
const sslWritePtr = Module.findExportByName(null, "SSL_write");

if (sslWritePtr) {
    console.log("Located SSL_write at: " + sslWritePtr);

    // Attach an interceptor to SSL_write
    Interceptor.attach(sslWritePtr, {
        onEnter: function (args) {
            // Log a message when the function is called
            console.log("DUDE: SSL_write called. Intercepting outgoing data.");

            // args[0] is the SSL session handle
            // args[1] is the buffer containing the data
            // args[2] is the length of the data in the buffer

            const len = args[2].toInt32();
            console.log("  - Data length: " + len + " bytes");

            // Optionall, you can inspect the data buffer itself.
            // Be aware that this is raw, likely encrypted application data.
            // console.log("  - Data (first 16 bytes):\n" + hexdump(args[1], { length: 16 }));
        },
        onLeave: function (retval) {
            // retval is the return value of SSL_write (number of bytes written)
            // console.log("SSL_write returned: " + retval.toInt32());
        }
    });

    console.log("DUDE: Hook activated. Waiting for Telegram to send data...");

} else {
    console.log("DUDE: Could not find SSL_write. Are you sure Telegram is running and using OpenSSL?");
    console.log("DUDE: Try tracing for other network functions like 'send' or 'write'.");
}
