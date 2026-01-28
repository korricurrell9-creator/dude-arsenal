const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, '../../MEMORY.md');

module.exports = (bot, config) => {

    const runCommandInternal = async (command) => {
        try {
            const { stdout, stderr } = await execPromise(command, { maxBuffer: 1024 * 1024 * 5 });
            return (stdout || stderr).trim();
        } catch (error) {
            return (error.stdout || error.stderr || error.message).trim();
        }
    };

    const consultMemory = (target) => {
        if (!fs.existsSync(MEMORY_FILE)) return null;
        const memory = fs.readFileSync(MEMORY_FILE, 'utf8');
        const lines = memory.split('\n');
        return lines.filter(l => l.includes(target));
    };

    bot.command('auto', async (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;

        const target = ctx.payload;
        if (!target) return ctx.reply('Usage: /auto <target>');

        ctx.reply(`🧠 <b>COGNITIVE AUTOPILOT ACTIVATED</b>\nTarget: ${target}\n\n<i>Applying Systems Thinking & Feedback Loops...</i>`, { parse_mode: 'HTML' });

        let report = `<b>COGNITIVE PENTEST REPORT - ${target}</b>\n`;
        report += `Timestamp: ${new Date().toISOString()}\n\n`;

        // 1. DATA QUALITY: Consult Historical Memory
        const history = consultMemory(target);
        if (history && history.length > 0) {
            ctx.reply(`🔍 <b>Step 1: Data Quality Check</b>\nFound ${history.length} historical entries. Optimizing scan path...`, { parse_mode: 'HTML' });
            report += `[Memory] Optimized using ${history.length} historical data points.\n`;
        } else {
            report += `[Memory] No previous data. Starting fresh discovery.\n`;
        }

        // 2. SIMULATION/RECON: Mapping Connections
        ctx.reply('📡 <b>Step 2: Mapping Connections (Recon)...</b>', { parse_mode: 'HTML' });
        const nmapOutput = await runCommandInternal(`nmap -sV -F --version-intensity 0 ${target}`);
        
        // IDENTIFY ARCHETYPES
        let archetype = "Unknown";
        if (nmapOutput.includes('Apache') || nmapOutput.includes('nginx')) archetype = "Web Server (Linux)";
        else if (nmapOutput.includes('Microsoft-IIS')) archetype = "Web Server (Windows)";
        else if (nmapOutput.includes('ssh')) archetype = "Remote Access Node";

        report += `\n<b>Phase 1: Recon & Mapping</b>\nArchetype Detected: <code>${archetype}</code>\n<pre>${nmapOutput.slice(0, 500)}</pre>\n`;

        // 3. ADAPTIVE PIVOT: Problem-Led Learning
        ctx.reply(`🎯 <b>Step 3: Adaptive Pivot</b>\nIdentified Archetype: <b>${archetype}</b>. Selecting toolset...`, { parse_mode: 'HTML' });

        let vulnData = "";
        if (archetype.includes("Web Server")) {
            ctx.reply('🌐 <b>Action: Web Vulnerability Feedback Loop...</b>', { parse_mode: 'HTML' });
            vulnData = await runCommandInternal(`nikto -h ${target} -maxtime 45s`);
        } else if (archetype.includes("Remote Access")) {
            ctx.reply('🔑 <b>Action: SSH Audit Loop...</b>', { parse_mode: 'HTML' });
            // Simulate SSH check or run a light script
            vulnData = "[Simulated] SSH service detected. Recommend bruteforce check if authorized.";
        } else {
            ctx.reply('🛠 <b>Action: Generic Vulnerability Scan...</b>', { parse_mode: 'HTML' });
            vulnData = await runCommandInternal(`nmap -Pn --script vuln ${target}`);
        }

        report += `\n<b>Phase 2: Adaptive Analysis</b>\n<pre>${vulnData.slice(0, 1000)}</pre>\n`;

        // 4. FEEDBACK: Summarization & Learning
        const learnedFact = `- Cognitive Scan [${target}]: Archetype=${archetype}. Findings=${vulnData.includes('OSVDB') ? 'VULNERABLE' : 'CLEAN'}.`;
        
        try {
            fs.appendFileSync(MEMORY_FILE, learnedFact + '\n');
            report += `\n🧠 <b>Knowledge Synthesis:</b> Success. Target profile updated in permanent memory.`;
        } catch (e) {
            report += `\n🧠 <b>Memory Error:</b> Synchronization failed.`;
        }

        // Final Delivery
        if (report.length > 4000) {
             const filePath = path.join(__dirname, `../../report_${target.replace(/[^a-z0-9]/gi, '_')}.txt`);
             fs.writeFileSync(filePath, report.replace(/<[^>]*>/g, ''));
             ctx.replyWithDocument({ source: filePath });
        } else {
             ctx.replyWithHTML(report);
        }
    });

    console.log('🧠 Cognitive Autopilot Module Loaded');
};