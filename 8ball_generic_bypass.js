Java.perform(function () {
    var EventsReceiver = Java.use('com.miniclip.events.EventsReceiver');
    EventsReceiver.onReceive.implementation = function (context, intent) {
        console.log('[+] Intercepted call to EventsReceiver.onReceive(). Doing nothing.');
        // By not calling the original method, we are effectively disabling all security event reporting.
    };

    var System = Java.use('java.lang.System');
    System.exit.implementation = function(status) {
        console.log('[+] System.exit() called with status ' + status + '. Preventing exit.');
    };
});