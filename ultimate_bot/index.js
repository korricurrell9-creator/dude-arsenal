const { Telegraf } = require('telegraf');
const config = require('./config');
const https = require('https');

// Force IPv4 to avoid Node.js IPv6 timeout issues
const agent = new https.Agent({
    keepAlive: true,
    family: 4 
});

const bot = new Telegraf(config.BOT_TOKEN, {
    telegram: { agent } 
});

// Middleware to strip command from text to get payload
bot.use((ctx, next) => {
    if (ctx.from) {
        console.log(`[Incoming Message from ID: ${ctx.from.id}] @${ctx.from.username || 'unknown'}`);
    }
    if (ctx.message && ctx.message.text && ctx.message.text.startsWith('/')) {
        const parts = ctx.message.text.split(' ');
        ctx.commandName = parts[0].substring(1);
        ctx.payload = parts.slice(1).join(' ');
    }
    return next();
});

console.log('🤖 ULTIMATE BOT SYSTEM ONLINE');
console.log('LOADING MODULES...');

// Load Modules
try {
    require('./modules/recon')(bot, config);
    require('./modules/exploit')(bot, config);
    require('./modules/weaponry')(bot, config);
    require('./modules/reflect')(bot, config);
    require('./modules/autopilot')(bot, config);
    require('./modules/discovery')(bot, config);
    require('./modules/systems')(bot, config);
    require('./modules/change_lab')(bot, config);
    require('./modules/autonomous_learning')(bot, config);
    console.log('✅ Modules loaded successfully.');
} catch (e) {
    console.error('❌ Error loading modules:', e);
}

bot.start((ctx) => {
    if (ctx.from.id !== config.OWNER_ID) return;
    const menu = `
<b>🤖 ULTIMATE BOT V2.1 (STABLE)</b>

<b>RECON:</b>
/scan &lt;target&gt; - Quick Nmap
/hunt &lt;user&gt; - Social Media Hunt
/whois &lt;domain&gt; - Domain Info

<b>EXPLOIT:</b>
/vuln &lt;target&gt; - Nmap Vuln Script
/nikto &lt;url&gt; - Web Scanner
/sqlmap &lt;url&gt; - SQL Injection

<b>WEAPONRY:</b>
/payload &lt;os&gt; &lt;ip&gt; &lt;port&gt; - Gen Shellcode
/crack &lt;svc&gt; &lt;trg&gt; &lt;usr&gt; &lt;dic&gt; - Hydra Brute

<b>SYSTEM:</b>
/help - Show this menu
    `;
    ctx.replyWithHTML(menu);
});

bot.help((ctx) => ctx.reply('See /start for commands.'));

// Launch with Retry Logic
const launchBot = async (retries = 5) => {
    try {
        console.log('📡 Establishing Uplink...');
        await bot.launch();
        console.log('🚀 Bot is running!');
    } catch (err) {
        if (retries > 0) {
            console.error(`⚠️ Connection Failed: ${err.message}. Retrying in 5s... (${retries} left)`);
            setTimeout(() => launchBot(retries - 1), 5000);
        } else {
            console.error('❌ Critical Failure: Unable to connect to Telegram API.');
            process.exit(1);
        }
    }
};

launchBot();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
