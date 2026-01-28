const { runSystemCommand } = require('../utils/exec');
const axios = require('axios');

module.exports = (bot, config) => {
    
    // /scan <target>
    bot.command('scan', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        const target = ctx.payload; 
        if (!target) return ctx.reply('Usage: /scan <target>');
        runSystemCommand(ctx, `nmap -F -T4 ${target}`, `Quick Scan on ${target}`);
    });

    // /whois <domain>
    bot.command('whois', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        const target = ctx.payload;
        if (!target) return ctx.reply('Usage: /whois <domain>');
        runSystemCommand(ctx, `whois ${target}`, `Whois Lookup for ${target}`);
    });

    // /hunt <username>
    bot.command('hunt', async (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        const username = ctx.payload;
        if (!username) return ctx.reply('Usage: /hunt <username>');
        
        ctx.reply(`🦅 Hunting for user: ${username}...`);
        
        const sites = [
            { name: 'GitHub', url: `https://github.com/${username}` },
            { name: 'Instagram', url: `https://www.instagram.com/${username}/` },
            { name: 'Twitter/X', url: `https://twitter.com/${username}` },
            { name: 'TikTok', url: `https://www.tiktok.com/@${username}` },
            { name: 'Telegram', url: `https://t.me/${username}` }
        ];

        let found = [];
        const checkSite = async (site) => {
            try {
                const res = await axios.get(site.url, { timeout: 5000 });
                if (res.status === 200) found.push(`<a href="${site.url}">${site.name}</a>`);
            } catch (e) {}
        };

        await Promise.all(sites.map(checkSite));

        if (found.length > 0) {
            ctx.replyWithHTML(`✅ <b>Found ${username} on:</b>\n\n` + found.join('\n'), { disable_web_page_preview: true });
        } else {
            ctx.reply(`❌ No accounts found for ${username}.`);
        }
    });
};