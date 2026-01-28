const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, '../../MEMORY.md');

module.exports = (bot, config) => {

    // --- FORBES TACTICS ---

    bot.command('impact', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        const target = ctx.payload;
        if (!target) return ctx.reply('Usage: /impact <target>');

        const analysis = `
<b>🌐 SYSTEMS THINKING: MEDIA & HUMAN IMPACT</b>
Target: ${target}

<b>1st Order Effect:</b> Technical compromise/Service disruption.
<b>2nd Order Effect:</b> PR crisis, customer data leak notification.
<b>3rd Order Effect:</b> Hostile viral coverage (e.g. TikTok/X unboxing of the breach).
<b>10th Order Effect:</b> Shift in national protectionism or industry-wide security regulation.

<b>Psychological Profile:</b> Likely to respond with "nationalistic fear" or "cultural anxiety" if triggered.
<b>Recommendation:</b> Use "storytelling" in your reports to manage stakeholder expectations.
        `;
        ctx.replyWithHTML(analysis);
    });

    bot.command('simulate', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        const target = ctx.payload;
        if (!target) return ctx.reply('Usage: /simulate <target>');

        ctx.reply(`🧪 <b>Digital Twin Simulation Engaged...</b>\nModeling adjacent systems for ${target}...`, { parse_mode: 'HTML' });

        let knowledge = "fresh";
        if (fs.existsSync(MEMORY_FILE)) {
            const mem = fs.readFileSync(MEMORY_FILE, 'utf8');
            if (mem.includes(target)) knowledge = "historical";
        }

        setTimeout(() => {
            const report = `
<b>📊 DIGITAL TWIN SIMULATION REPORT</b>
Target: ${target} (Knowledge: ${knowledge})

<b>Predicted Interactions:</b>
- IDS/WAF likely to trigger on Phase 1 Recon.
- Adjacent system (Auth Server) may fail-closed if hammered.
- Expected 10th-order outcome: Permanent IP blacklist within 4 hours.

<b>Simulation Result:</b> 85% success probability if using low-intensity version-intensity.
            `;
            ctx.replyWithHTML(report);
        }, 2000);
    });

    bot.command('plan', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        const problem = ctx.payload;
        if (!problem) return ctx.reply('Usage: /plan <the_problem_statement>');

        const formulation = `
<b>🎯 PROBLEM-LED FORMULATION</b>
Goal: ${problem}

<b>Root-Cause Analysis:</b>
1. Identify the mechanism of the current security barrier.
2. Cross-reference with known archetypes.
3. Formulate the specific "Interaction" required (not just a tool).

<b>Proposed Strategy:</b>
- <b>Step 1:</b> Semantic mapping of the target's adjacent systems.
- <b>Step 2:</b> Test the "Emotional System" (social engineering/phishing).
- <b>Step 3:</b> Execute technical pivot only after simulation success.
        `;
        ctx.replyWithHTML(formulation);
    });

    // --- ACADEMIC FRAMEWORKS (Nick Bunyan / OU / ISO) ---

    bot.command('iceberg', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        const event = ctx.payload;
        if (!event) return ctx.reply('Usage: /iceberg <event/incident>');

        const iceberg = `
<b>🧊 THE ICEBERG MODEL ANALYSIS</b>
Event: ${event}

<b>1. The Event (What just happened?)</b>
   → ${event} detected/occurred.

<b>2. Patterns & Trends (What's been happening?)</b>
   → Recurring instances of this event over time.
   → Increased frequency during high-traffic periods.

<b>3. System Structure (What influences these patterns?)</b>
   → Underlying policies, physical connections, and power dynamics.

<b>4. Mental Models (What assumptions shape the system?)</b>
   → Values, assumptions, and beliefs that drive the behavior.

<b>Leverage Point:</b> Shift the mental model to break the pattern.
        `;
        ctx.replyWithHTML(iceberg);
    });

    bot.command('eposa', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        const issue = ctx.payload;
        if (!issue) return ctx.reply('Usage: /eposa <complex_issue>');

        const eposa = `
<b>🧭 EPOSA SYSTEM MAPPING</b>
Issue: ${issue}

<b>[E]nvironment:</b> Ecological and physical infrastructure issues.
<b>[P]luralism:</b> Different perspectives (Attacker, Defender, User).
<b>[O]rganisations:</b> Legal, political, and decision-making structures.
<b>[S]ocial:</b> Social justice and human equity issues.
<b>[E]conomy/Technology:</b> Financial and technical constraints.
<b>[A]gents:</b> Individuals and groups making decisions.
        `;
        ctx.replyWithHTML(eposa);
    });

    // ISO 14040:2006 Life Cycle Assessment
    bot.command('lca', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        const subject = ctx.payload || "The Operation";
        
        const lca = `
<b>♻️ ISO 14040:2006 LIFE CYCLE ASSESSMENT</b>
Subject: ${subject}

<b>1. Goal & Scope Definition:</b>
   → Determine systemic boundaries and intended applications.

<b>2. Inventory Analysis (LCI):</b>
   → Data collection on resource consumption (CPU, Bandwidth, Human hours).

<b>3. Impact Assessment (LCIA):</b>
   → Evaluate environmental and social consequences.

<b>4. Interpretation:</b>
   → Summarize results, check limitations, and provide recommendations.
        `;
        ctx.replyWithHTML(lca);
    });

    // --- OPEN UNIVERSITY DIAGRAMMING TECHNIQUES ---

    bot.command('spray', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        const topic = ctx.payload;
        if (!topic) return ctx.reply('Usage: /spray <topic>');

        const spray = `
<b>🌿 SPRAY DIAGRAM: ${topic}</b>
<i>Extracting and classifying important ideas...</i>

<b>Main Theme: ${topic}</b>
├── <b>Sub-Theme A: Technical</b>
│   └── Component 1, Component 2
├── <b>Sub-Theme B: Personnel</b>
│   └── Stakeholders, Users
└── <b>Sub-Theme C: Environmental</b>
    └── Infrastructure, Network
        `;
        ctx.replyWithHTML(spray);
    });

    bot.command('map', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        const topic = ctx.payload;
        if (!topic) return ctx.reply('Usage: /map <topic>');

        const map = `
<b>🗺️ SYSTEMS MAP: ${topic}</b>
<i>Defining components and boundaries...</i>

<b>The System Boundary:</b> ${topic} Operations
<b>Components Inside:</b>
- Core Database
- API Endpoints
- Internal Admin Tools
<b>Components Outside (Environment):</b>
- Public Internet
- External Vendors
- Regulatory Bodies
        `;
        ctx.replyWithHTML(map);
    });

    bot.command('influence', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        const topic = ctx.payload;
        if (!topic) return ctx.reply('Usage: /influence <topic>');

        const influence = `
<b>⚡ INFLUENCE DIAGRAM: ${topic}</b>
<i>Exploring power and relationships...</i>

- <b>CTO</b> ──(high)──► IT Budget ──(medium)──► Security Stack
- <b>User Base</b> ──(feedback)──► Product Dev ──(low)──► Security Policy
- <b>Regulatory Body</b> ──(control)──► Data Policy ──(high)──► Encryption Standards
        `;
        ctx.replyWithHTML(influence);
    });

    bot.command('causes', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        const event = ctx.payload;
        if (!event) return ctx.reply('Usage: /causes <event>');

        const causes = `
<b>🔗 MULTIPLE CAUSE DIAGRAM: ${event}</b>
<i>Tracing causal connections back to origin...</i>

<b>The Event: ${event}</b>
↖── <b>Cause A:</b> Misconfigured Firewall Rule
    ↖── <b>Sub-Cause:</b> Human error during update
↖── <b>Cause B:</b> Outdated Software Patch
    ↖── <b>Sub-Cause:</b> Budget constraints delaying upgrade
        `;
        ctx.replyWithHTML(causes);
    });

    bot.command('loop', (ctx) => {
        if (ctx.from.id !== config.OWNER_ID) return;
        const topic = ctx.payload;
        if (!topic) return ctx.reply('Usage: /loop <topic>');

        const loop = `
<b>🔄 CAUSAL LOOP DIAGRAM: ${topic}</b>
<i>Visualizing dynamic interrelationships...</i>

<b>Reinforcing Loop (R):</b>
- More Security Incidents ──► More Budget ──► Better Tools ──► More Incidents Detected (+)

<b>Balancing Loop (B):</b>
- Attack Frequency ──► Defense Hardening ──► Attack Difficulty ──► Reduced Frequency (-)
        `;
        ctx.replyWithHTML(loop);
    });

    console.log('🌐 Systems Thinking Module Fully Loaded (Forbes + OU + ISO)');
};
