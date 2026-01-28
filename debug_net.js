const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
const axios = require('axios');

const TOKEN = '7972529532:AAFXWYOD7Xmt9MCPTA1aGnlzIRyEQ9ZJnMU';
const URL = `https://api.telegram.org/bot${TOKEN}/getMe`;

console.log(`[*] Probing ${URL}...`);

axios.get(URL, { timeout: 10000 })
  .then(res => {
    console.log("[+] CONNECTION SUCCESSFUL!");
    console.log("Status:", res.status);
    console.log("Data:", res.data);
  })
  .catch(err => {
    console.error("[-] CONNECTION FAILED");
    console.error("Code:", err.code);
    console.error("Message:", err.message);
    if (err.response) {
        console.error("Response Status:", err.response.status);
    }
  });
