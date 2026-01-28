const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, '../../MEMORY.md');

module.exports = (bot, config) => {

    // --- SYSTEMS CHANGE LAB TACTICS ---

    // COMMAND 1: /reconfigure <target_system>
    // Goal: Reconfigure the component parts and interactions to form a new system.
    bot.command('reconfigure', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        const system = ctx.payload;
        if (!system) return ctx.reply('Usage: /reconfigure <target_system>');

        const plan = `
<b>🔄 SYSTEM RECONFIGURATION PLAN</b>
Target: ${system}

<b>Objective:</b> Form a new system that behaves in a qualitatively different way (Systems Change).

<b>1. Component Analysis:</b>
   - <b>Living Organisms:</b> Admin staff, Users.
   - <b>Physical Entities:</b> Servers, Firewalls.
   - <b>Institutions:</b> Security Policies, Compliance.

<b>2. Proposed Reconfiguration:</b>
   - <b>Shift:</b> From "Fossil-Fuel" (Legacy Auth) to "Renewable" (Token-based/Exploited Trust).
   - <b>Interactions:</b> Alter the web of relationships between Users and the Auth Server.

<b>3. Outcome:</b>
   - A system that appears normal but serves our objectives (Qualitative Difference).
        `;
        ctx.replyWithHTML(plan);
    });

    // COMMAND 2: /shift <type> <target>
    // Goal: Differentiate between incremental change (fuel efficiency) and transformational change (new energy).
    bot.command('shift', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        const [type, target] = ctx.payload.split(' ');
        if (!type || !target) return ctx.reply('Usage: /shift <incremental|transformational> <target>');

        let strategy = '';
        if (type.toLowerCase() === 'incremental') {
            strategy = `
<b>📈 INCREMENTAL SHIFT: ${target}</b>
<i>"Improving fuel efficiency"</i>

- <b>Action:</b> Low-noise scanning, minor policy evasion.
- <b>Goal:</b> Create an enabling environment for future attacks.
- <b>Risk:</b> Low. Maintains the existing system structure.
            `;
        } else {
            strategy = `
<b>🚀 TRANSFORMATIONAL SHIFT: ${target}</b>
<i>"New Energy System"</i>

- <b>Action:</b> Full root compromise, rewriting admin privileges.
- <b>Goal:</b> Fundamental change to a new state (Pwned).
- <b>Risk:</b> High. Replaces the underlying logic of the system.
            `;
        }
        ctx.replyWithHTML(strategy);
    });

    // COMMAND 3: /boundary <scale>
    // Goal: Define the system boundary (a subjective exercise).
    bot.command('boundary', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        const scale = ctx.payload; 
        if (!scale) return ctx.reply('Usage: /boundary <micro|meso|macro>');

        let boundaryDef = '';
        if (scale === 'micro') {
            boundaryDef = `<b>🔍 MICRO SCALE:</b> The "Beehive" (Single Server/App). Focus on code-level interactions.`;
        } else if (scale === 'meso') {
            boundaryDef = `<b>🏘️ MESO SCALE:</b> The "Agricultural Landscape" (Corporate Network). Focus on lateral movement and user groups.`;
        } else {
            boundaryDef = `<b>🌍 MACRO SCALE:</b> The "Global Food System" (Internet/Supply Chain). Focus on upstream providers and global routing.`;
        }
        
        ctx.replyWithHTML(boundaryDef + `\n<i>Bounding is subjective. We choose to emphasize vulnerabilities.</i>`);
    });

    console.log('🌍 Systems Change Lab Module Loaded');
};
