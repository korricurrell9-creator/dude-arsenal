const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, '../../MEMORY.md');

module.exports = (bot, config) => {

    bot.command('discover', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;

        if (!fs.existsSync(MEMORY_FILE)) return ctx.reply('No memory found to analyze.');

        const memory = fs.readFileSync(MEMORY_FILE, 'utf8');
        const lines = memory.split('\n').filter(l => l.trim().length > 0);

        if (lines.length < 5) return ctx.reply('Memory too shallow for pattern discovery. Perform more actions.');

        ctx.reply('🔍 <b>Analyzing Workflow Patterns...</b>\n<i>Identifying recurring archetypes and skill candidates...</i>', { parse_mode: 'HTML' });

        // Simple pattern matching for discovery
        const patterns = {
            'Recon Maven': lines.filter(l => l.toLowerCase().includes('scan') || l.toLowerCase().includes('nmap')).length,
            'Web Hunter': lines.filter(l => l.toLowerCase().includes('web') || l.toLowerCase().includes('nikto')).length,
            'Credential Cracker': lines.filter(l => l.toLowerCase().includes('hydra') || l.toLowerCase().includes('ssh')).length
        };

        let discoveryReport = '════════════════════════════════════\n';
        discoveryReport += '<b>SKILL CANDIDATES DISCOVERED</b>\n';
        discoveryReport += '════════════════════════════════════\n\n';

        let found = false;
        for (const [skill, count] of Object.entries(patterns)) {
            if (count >= 3) {
                found = true;
                const confidence = count > 10 ? 'High' : 'Medium';
                discoveryReport += `<b>${skill} (${confidence})</b>\n`;
                discoveryReport += `→ Evidence: ${count} repeating interactions.\n`;
                discoveryReport += `→ Recommendation: Create /${skill.toLowerCase().replace(' ', '-')} specialized command.\n\n`;
            }
        }

        if (!found) {
            discoveryReport += 'No strong patterns detected yet. Keep working, and I will learn your style.';
        }

        discoveryReport += '════════════════════════════════════';
        
        ctx.replyWithHTML(discoveryReport);
    });

    console.log('✨ Discovery Module Loaded');
};
