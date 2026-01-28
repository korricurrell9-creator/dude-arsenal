const { exec } = require('child_process');

const escapeHTML = (text = '') => {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

const runSystemCommand = async (ctx, command, description) => {
    await ctx.reply(`⏳ Running ${description}... please wait.`);
    
    // Using a large buffer for tools that output a lot of text
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, async (err, stdout, stderr) => {
        const rawOutput = stdout || stderr || "No output.";
        const output = escapeHTML(rawOutput);

        if (output.length > 4000) {
            const chunk = output.slice(0, 4000);
            await ctx.replyWithHTML(`📄 <b>Result (Truncated):</b>\n<pre>${chunk}</pre>`);
            const chunk2 = output.slice(4000, 8000);
            if (chunk2) await ctx.replyWithHTML(`<pre>${chunk2}</pre>`);
        } else {
            await ctx.replyWithHTML(`📄 <b>Result:</b>\n<pre>${output}</pre>`);
        }
    });
};

module.exports = { runSystemCommand, escapeHTML };
