
function waitForJava() {
    if (Java.available) {
        Java.perform(function () {
            console.log("[DUDE] Java API is now available! Let the games begin.");
        });
    } else {
        console.log("[DUDE] Java API not yet available, waiting...");
        setTimeout(waitForJava, 200);
    }
}

waitForJava();
