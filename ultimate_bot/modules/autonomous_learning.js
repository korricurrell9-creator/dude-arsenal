const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const MEMORY_FILE = path.join(__dirname, '../../MEMORY.md');

// Zinn, Moore, & Core Architecture: Three-Layer System
// 1. Deliberative (Planner)
// 2. Executive (Doer)
// 3. Reactive (Monitor/Tutor)

module.exports = (bot, config) => {

    // THE INTERNAL TUTOR (Reactive Layer)
    // Analyzes the "Student's" (Executive Layer) performance and offers hints/corrections.
    const internalTutor = (goal, output, attempt) => {
        // Concept: "Handling Impasses" - Detect failure and guide repair.
        
        if (output.includes('Connection refused') || output.includes('timeout')) {
            return {
                status: 'impasse',
                hint: 'Target is down or firewall is dropping packets. Switch strategies.',
                adjustment: '-Pn -sS' // Skip ping, stealth scan
            };
        }
        
        if (output.includes('403 Forbidden') || output.includes('WAF')) {
            return {
                status: 'impasse',
                hint: 'WAF detected. Standard payload blocked.',
                adjustment: '--tamper=space2comment --random-agent'
            };
        }

        if (output.length < 50) {
            return {
                status: 'confusion',
                hint: 'Output is suspiciously empty. Did we use the right interface?',
                adjustment: '-e eth0'
            };
        }

        return { status: 'success', hint: 'Proceed.', adjustment: null };
    };

    // THE AUTONOMOUS LOOP (Self-Learning Cycle)
    const runAutonomousLoop = async (ctx, target, command, goal) => {
        let currentCommand = command;
        let attempts = 0;
        const maxAttempts = 3;

        ctx.reply(`⚙️ <b>SELF-LEARNING LOOP INITIATED</b>\nGoal: ${goal}\nInitial Plan: <code>${currentCommand}</code>`, { parse_mode: 'HTML' });

        while (attempts < maxAttempts) {
            attempts++;
            
            // Step 1: Execute (The Student acts)
            let output = '';
            try {
                const { stdout, stderr } = await execPromise(currentCommand, { timeout: 10000 });
                output = stdout || stderr;
            } catch (e) {
                output = e.stdout || e.stderr || e.message;
            }

            // Step 2: Self-Explanation / Feedback (The Tutor intervenes)
            const analysis = internalTutor(goal, output, attempts);

            if (analysis.status === 'success') {
                // Grounding: Success confirmed. Commit to memory.
                const lesson = `[LEARNED] Strategy for ${target} (${goal}): Use '${currentCommand}'. Success confirmed.`;
                fs.appendFileSync(MEMORY_FILE, lesson + '\n');
                
                ctx.reply(`✅ <b>SUCCESS (Attempt ${attempts})</b>\nSelf-Correction applied. Learning grounded in memory.\n<pre>${output.slice(0, 200)}...</pre>`, { parse_mode: 'HTML' });
                return;
            } else {
                // Impasse: Apply feedback and retry
                ctx.reply(`⚠️ <b>IMPASSE DETECTED (Attempt ${attempts})</b>\n<i>Internal Monologue:</i> "${analysis.hint}"\n\n🔄 <b>Refining Plan...</b>`, { parse_mode: 'HTML' });
                
                if (analysis.adjustment) {
                    currentCommand += ` ${analysis.adjustment}`;
                    ctx.reply(`👉 <b>New Strategy:</b> <code>${currentCommand}</code>`, { parse_mode: 'HTML' });
                } else {
                    break; // No further ideas
                }
            }
        }
        
        ctx.reply(`❌ <b>FAILURE</b>\nMax attempts reached. I need a human to resolve this impasse.`);
    };

    // COMMAND: /hack <target>
    // Triggers the autonomous self-learning process
    bot.command('hack', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        const target = ctx.payload;
        if (!target) return ctx.reply('Usage: /hack <target>');

        // Initial naive plan (The "Novice" approach)
        const initialCommand = `nmap -F ${target}`;
        
        runAutonomousLoop(ctx, target, initialCommand, `Full compromise of ${target}`);
    });

    console.log('🤖 Autonomous Self-Learning Module Loaded (Zinn/Moore Architecture)');
};
