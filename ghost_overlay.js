// ghost_overlay.js
Java.perform(function() {
    console.log("[*] DUDE: Ghost Overlay starting...");
    
    var Activity = Java.use("android.app.Activity");
    var String = Java.use("java.lang.String");
    var Paint = Java.use("android.graphics.Paint");
    var Color = Java.use("android.graphics.Color");
    
    var paint = Paint.$new();
    paint.setColor(Color.GREEN.value);
    paint.setTextSize(80);
    paint.setFakeBoldText(true);

    Activity.onResume.implementation = function() {
        this.onResume();
        var actName = this.getClass().getName();
        console.log("[+] Hooking draw for " + actName);
        
        var decor = this.getWindow().getDecorView();
        decor.dispatchDraw.implementation = function(canvas) {
            this.dispatchDraw(canvas);
            canvas.drawText(String.$new("☢️ DUDE ROOTED ☢️"), 100, 150, paint);
        };
    };
    
    Java.choose("android.app.Activity", {
        onMatch: function(a) {
            if (!a.isFinishing()) {
                var decor = a.getWindow().getDecorView();
                decor.dispatchDraw.implementation = function(canvas) {
                    this.dispatchDraw(canvas);
                    canvas.drawText(String.$new("☢️ DUDE ROOTED ☢️"), 100, 150, paint);
                };
            }
        },
        onComplete: function() {}
    });
});
