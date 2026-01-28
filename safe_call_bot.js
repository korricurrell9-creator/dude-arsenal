const { Telegraf } = require('telegraf');
const { exec } = require('child_process');

// ⚠️ SECURITY NOTICE:
// This bot is configured for TESTING purposes only using the standard Asterisk 'demo-echotest'.
// It allows verifying connectivity without engaging in unauthorized activities.
// Replace 'YOUR_BOT_TOKEN' with your actual Telegram bot token.

const bot = new Telegraf('YOUR_BOT_TOKEN');

bot.start((ctx) => ctx.reply('Welcome! Use /call <number> to test VoIP connectivity via Asterisk Echo Test.'));

bot.command('call', (ctx) => {
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
        return ctx.reply('Usage: /call <number>');
    }

    const number = args[1];

    // Basic sanitization to prevent command injection
    if (!/^\d+$/.test(number)) {
        return ctx.reply('Invalid number format. Use digits only.');
    }

    const sipPeer = 'vishing_trunk'; // Default peer from your sip.conf, strictly for testing
    
    // We strictly use the 'demo-echotest' application for safety verification.
    // This ensures the bot is used for connectivity testing, not unauthorized broadcasts.
    const asteriskCommand = `asterisk -rx "channel originate SIP/${sipPeer}/${number} application Playback demo-echotest"`;

    ctx.reply(`Initiating test call to ${number} via ${sipPeer}...`);

    exec(asteriskCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return ctx.reply(`Failed to initiate call: ${error.message}`);
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            // Asterisk often outputs to stderr even on success, but we log it.
        }
        console.log(`Asterisk Output: ${stdout}`);
        ctx.reply('Call command sent to Asterisk PBX.');
    });
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('Bot is running...');
