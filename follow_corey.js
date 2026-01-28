// follow_corey.js
// A Frida script to assist in following user @corey.sxhmut on TikTok
// Combined SSL Bypass + User Targeting + Action Discovery + UI Automation

    function findAndClickFollow() {
        Java.perform(function() {
            console.log("[*] Searching UI for 'Follow' status...");
            var foundAction = false;
            var alreadyFollowing = false;
            
            Java.choose("android.view.View", {
                onMatch: function(view) {
                    try {
                        if (view.getVisibility() !== 0) return; // Skip hidden

                        var desc = view.getContentDescription() ? view.getContentDescription().toString() : "";
                        var text = view.getText ? view.getText().toString() : "";
                        var combined = (desc + " " + text).toLowerCase();

                        // Check for "Following" status
                        if (combined.includes("following") || combined === "friends") {
                            // We found a button that says we are following
                            alreadyFollowing = true;
                            // console.log("    (Found status: " + (text || desc) + ")");
                        }
                        
                        // Check for "Follow" action (exact match or specific phrases)
                        // Avoid matching "Following" or "Followers"
                        var isFollowButton = false;
                        if (text.toLowerCase() === "follow" || desc.toLowerCase() === "follow") isFollowButton = true;
                        if (text.toLowerCase() === "follow back" || desc.toLowerCase() === "follow back") isFollowButton = true;
                        
                        if (isFollowButton) {
                            console.log("[+] Found 'Follow' button!");
                            console.log("    Text: " + text);
                            console.log("    Desc: " + desc);
                            
                            console.log("[!] EXECUTING CLICK...");
                            foundAction = true;
                            
                            var activity = Java.use("android.app.ActivityThread").currentActivity();
                            if (activity) {
                                activity.runOnUiThread(Java.registerClass({
                                    name: "org.korri.Clicker" + Date.now(),
                                    implements: [Java.use("java.lang.Runnable")],
                                    methods: {
                                        run: function() {
                                            try {
                                                view.performClick();
                                                console.log("[+] Click Sent Successfully!");
                                            } catch(e) {
                                                console.log("[-] Click Error: " + e.message);
                                            }
                                        }
                                    }
                                }).$new());
                            } else {
                                view.performClick();
                                console.log("[+] Click Sent (No Activity Context)!");
                            }
                        }
                    } catch(e) {}
                },
                onComplete: function() {
                    if (foundAction) {
                        console.log("[*] Follow action triggered.");
                    } else if (alreadyFollowing) {
                        console.log("[*] STATUS: You are ALREADY following @corey.sxhmut.");
                    } else {
                        console.log("[-] Could not find 'Follow' or 'Following' button.");
                        console.log("    Make sure the profile is fully loaded on screen.");
                    }
                }
            });
        });
    }

    function dumpUi() {
        Java.perform(function() {
            console.log("[*] Dumping visible UI elements...");
            Java.choose("android.view.View", {
                onMatch: function(view) {
                    try {
                        if (view.getVisibility() === 0) {
                            var text = view.getText ? view.getText().toString() : "";
                            var desc = view.getContentDescription();
                            if (text || desc) {
                                console.log(" - View [" + view.$className + "]: Text='" + text + "', Desc='" + desc + "'");
                            }
                        }
                    } catch(e) {}
                },
                onComplete: function() { console.log("[*] Dump complete."); }
            });
        });
    }

    rpc.exports = {
        follow: findAndClickFollow,
        dumpUi: dumpUi
    };
Java.perform(function() {
    console.log("[*] Script started for target: @corey.sxhmut");

    // 1. SSL PINNING BYPASS
    try {
        var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");
        TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
            return untrustedChain;
        };
        console.log("[+] SSL Pinning Bypass active.");
    } catch(e) {}

    // 2. TARGET IDENTIFICATION & DATA EXTRACTION
    try {
        var UserClass = Java.use("com.ss.android.ugc.aweme.profile.model.User");
        
        UserClass.getNickname.implementation = function() {
            var nickname = this.getNickname();
            if (nickname === "corey.sxhmut" || nickname === "@corey.sxhmut") {
                console.log("\n[!!!] TARGET FOUND: " + nickname);
                
                // Extract Personal Info
                console.log("\n--- [ TARGET PERSONAL INFO ] ---");
                console.log("UID:        " + this.getUid());
                console.log("SecUID:     " + this.getSecUid());
                console.log("Short ID:   " + this.getShortId());
                console.log("Unique ID:  " + this.getUniqueId());
                console.log("Nickname:   " + this.getNickname());
                console.log("Signature:  " + this.getSignature()); // Bio
                console.log("Birthday:   " + this.getBirthday());  // Often hidden/masked
                console.log("Region:     " + this.getRegion());
                console.log("Language:   " + this.getLanguage());
                
                // Contact/Social Info (Often null/empty unless public)
                try { console.log("Email:      " + this.getEmail()); } catch(e) {}
                try { console.log("Phone:      " + this.getBindPhone()); } catch(e) {}
                try { console.log("Twitter:    " + this.getTwitterName()); } catch(e) {}
                try { console.log("YouTube:    " + this.getYoutubeChannelTitle()); } catch(e) {}
                try { console.log("Ins ID:     " + this.getInsId()); } catch(e) {}
                
                // Account State
                try { console.log("Private:    " + this.isSecret()); } catch(e) {}
                try { console.log("Verified:   " + this.isLive()); } catch(e) {}
                
                console.log("--------------------------------\n");

                console.log("[*] You can now type 'rpc.exports.follow()' in the terminal.\n");
            }
            return nickname;
        };
    } catch(e) {
        console.log("[-] User Model hook failed: " + e.message);
    }

        // 3. AUTO-FOLLOW DISCOVERY

        var potentialClasses = [

            "com.ss.android.ugc.aweme.profile.presenter.FollowPresenter",

            "com.ss.android.ugc.aweme.userservice.UserService"

        ];

    

        potentialClasses.forEach(function(className) {

            try {

                var Clazz = Java.use(className);

                // Check if class is valid before proceeding

                if (!Clazz) return;

    

                // Use a safer way to check for methods if possible, or wrap in try-catch

                try {

                    var methods = Clazz.class.getDeclaredMethods();

                    methods.forEach(function(method) {

                        var methodName = method.getName();

                        if (methodName.toLowerCase().includes("follow")) {

                            try {

                                Clazz[methodName].implementation = function() {

                                    console.log("[API CALL] " + className + "." + methodName + " intercepted.");

                                    return this[methodName].apply(this, arguments);

                                }

                            } catch(err) {}

                        }

                    });

                } catch(e) {

                    // console.log("[-] Could not reflect methods for " + className);

                }

            } catch(e) {

                // console.log("[-] Class not found or accessible: " + className);

            }

        });

    });

    