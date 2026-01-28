const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, '../../MEMORY.md');
const QUEUE_FILE = path.join(__dirname, '../../learnings_queue.json');

// Ensure files exist
if (!fs.existsSync(MEMORY_FILE)) fs.writeFileSync(MEMORY_FILE, '# Permanent Memory\n\n');
if (!fs.existsSync(QUEUE_FILE)) fs.writeFileSync(QUEUE_FILE, '[]');

// Regex patterns for detection (mimicking claude-reflect)
const CORRECTION_PATTERNS = [
    /^no,?\s/i,
    /^actually,?\s/i,
    /^that'?s wrong/i,
    /^don'?t use/i,
    /^use\s.+instead/i,
    /^remember:/i
];

module.exports = (bot, config) => {
    
    // Middleware for capturing learnings
    bot.use((ctx, next) => {
        if (!ctx.message || !ctx.message.text) return next();

        const text = ctx.message.text;
        
        // Skip commands
        if (text.startsWith('/')) return next();

        // Check for correction patterns
        const isCorrection = CORRECTION_PATTERNS.some(pattern => pattern.test(text));

        if (isCorrection) {
            const queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
            
            const learning = {
                text: text,
                user: ctx.from ? ctx.from.username : 'unknown',
                timestamp: new Date().toISOString(),
                confidence: 0.8 // Simulated confidence
            };

            queue.push(learning);
            fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
            
            // Optional: Ack capture (can be silent)
            // ctx.reply('✍️ Correction captured. Run /reflect to review.');
        }

        return next();
    });

    // Command: /reflect
    bot.command('reflect', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;

        const queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));

        if (queue.length === 0) {
            return ctx.reply('No pending learnings in queue.');
        }

        let msg = '<b>🔍 Pending Learnings:</b>\n\n';
        queue.forEach((item, index) => {
            msg += `<b>${index + 1}.</b> ${item.text}\n`;
        });
        msg += '\nReply with <code>/approve &lt;number&gt;</code> to save to memory.';
        
        ctx.replyWithHTML(msg);
    });

    // Command: /approve <index>
    bot.command('approve', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;

        const parts = ctx.message.text.split(' ');
        if (parts.length < 2) return ctx.reply('Usage: /approve <number> or /approve all');

        const arg = parts[1];
        let queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));

        if (arg === 'all') {
            const newMemory = queue.map(i => `- ${i.text}`).join('\n');
            fs.appendFileSync(MEMORY_FILE, newMemory + '\n');
            fs.writeFileSync(QUEUE_FILE, '[]'); // Clear queue
            return ctx.reply(`✅ All ${queue.length} learnings saved to MEMORY.md`);
        }

        const index = parseInt(arg) - 1;
        if (isNaN(index) || index < 0 || index >= queue.length) {
            return ctx.reply('Invalid index.');
        }

        const item = queue[index];
        fs.appendFileSync(MEMORY_FILE, `- ${item.text}\n`);
        
        // Remove from queue
        queue.splice(index, 1);
        fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));

        ctx.reply(`✅ Saved: "${item.text}"`);
    });

    // Command: /memory - Read current memory
    bot.command('memory', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        
        const memory = fs.readFileSync(MEMORY_FILE, 'utf8');
        if (memory.length > 3000) {
            ctx.replyWithDocument({ source: MEMORY_FILE });
        } else {
            ctx.reply(memory || 'Memory is empty.');
        }
    });

    console.log('🧠 Reflect Module Loaded (Self-Learning Active)');
};
