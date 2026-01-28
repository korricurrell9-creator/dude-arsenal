const dns = require('dns');
const axios = require('axios');

console.log("--- DNS DIAGNOSTICS ---");
dns.lookup('api.telegram.org', { all: true }, (err, addresses) => {
    if (err) console.error("DNS Lookup Error:", err);
    else console.log("Telegram IPs:", addresses);
});

console.log("\n--- CONNECTIVITY CHECK ---");
// Check Google
axios.get('https://www.google.com', { timeout: 5000 })
    .then(res => console.log("[+] Google: REACHABLE"))
    .catch(err => console.log("[-] Google: UNREACHABLE (" + err.code + ")"));

// Check Telegram again with explicit IPv4 family (if supported by axios/agent)
const https = require('https');
const agent = new https.Agent({ family: 4 });

axios.get('https://api.telegram.org', { httpsAgent: agent, timeout: 5000 })
    .then(res => console.log("[+] Telegram (Root): REACHABLE"))
    .catch(err => {
        console.log("[-] Telegram (Root): UNREACHABLE (" + err.code + ")");
         if (err.response) console.log("Status:", err.response.status);
    });

