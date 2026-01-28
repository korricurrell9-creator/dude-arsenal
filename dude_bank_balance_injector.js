Java.perform(function () {
    console.log("[*] DUDE: Initializing Hybrid Injector (WebView + TextView)...");

    var StringClass = Java.use("java.lang.String");

    // --- 1. TEXTVIEW HOOK (Native UI) ---
    try {
        var TextView = Java.use("android.widget.TextView");
        TextView.setText.overload('java.lang.CharSequence').implementation = function (text) {
            if (text) {
                var str = text.toString();
                // Broadened regex: Matches $123, 123.45, 1,234.56, 1 234.56, etc.
                if (str.match(/(\$|AUD)?\s?\d{1,3}(?:[,\s.]\d{3})*(?:[.,]\d{2})?/)) { 
                    // Filter: Must look like money (contain digits and maybe separators)
                    // Avoid replacing simple text like "2024" or "10:00"
                    if ((str.includes("$") || str.includes(".") || str.includes(",")) && str.length < 20) {
                         // console.log("[+] Replacing TextView: " + str);
                         // DUDE: Force the visual.
                         var newText = "$700,000.00";
                         this.setText.overload('java.lang.CharSequence').call(this, StringClass.$new(newText));
                         return;
                    }
                }
            }
            this.setText.overload('java.lang.CharSequence').call(this, text);
        };
    } catch (e) {}

    // --- 2. WEBVIEW HOOK (The likely target) ---
    try {
        var WebView = Java.use("android.webkit.WebView");
        
        // This JS payload searches for money patterns in the HTML and replaces them.
        // It runs every 1 second.
        var jsCode = "javascript:(" +
            "function(){" +
                "try{"
                    "setInterval(function(){ " +
                        "var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false);" +
                        "var node;" +
                        "while(node=walker.nextNode()){ " +
                            "var t=node.nodeValue;" +
                            // Regex: Catch anything that looks like a balance
                            "if(t && (t.includes('$') || t.match(/\\d{1,3}[,\\s.]\\d{3}/))){ " +
                                "if(t.length < 25 && !t.includes(':') && !t.includes('Call')){"
                                    "node.nodeValue='$700,000.00';" +
                                "}" +
                            "}" +
                        "}" +
                    "}, 250);" + // Aggressive refresh
                "}catch(e){}" +
            "})()";

        // Hook loadUrl. This is the standard way to navigate OR run JS.
        WebView.loadUrl.overload('java.lang.String').implementation = function (url) {
            this.loadUrl.overload('java.lang.String').call(this, url);
            
            // If this is a page load (http/https), append our script
            if (url && (url.startsWith("http") || url.startsWith("file"))) {
                // console.log("[*] Injecting JS into: " + url);
                this.loadUrl.overload('java.lang.String').call(this, jsCode);
            }
        };
        
    } catch(e) {
        console.log("[-] WebView hook failed: " + e);
    }

    console.log("[*] DUDE: Hybrid hooks active. Log in and check.");
});