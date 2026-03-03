import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Learning.css';

/* ─────────────────────────────────────────────
   LEARNING PAGE — COMPLETE OVERHAUL
   Glassmorphism + Skeuomorphism | Mobile-First
───────────────────────────────────────────── */

const SKILL_TREES = {
    beginner: {
        label: '🛡️ Recruit',
        sublabel: 'Start Your Journey',
        color: '#00cc66',
        glow: 'rgba(0,204,102,0.35)',
        modules: [
            {
                id: 'password',
                icon: '🔐',
                badge: 'INTERACTIVE',
                title: 'Password Fortress',
                subtitle: 'Strength Analyzer',
                description: 'Test your password against real-world attack vectors. See why length, entropy, and character diversity matter.',
                difficulty: 1,
                xp: 50,
                component: 'PasswordModule',
                tags: ['Passwords', 'Brute Force', 'Entropy'],
            },
            {
                id: 'phishing',
                icon: '🎣',
                badge: 'QUIZ',
                title: 'Phishing Detector',
                subtitle: 'Email Threat Analysis',
                description: 'Train your eyes to catch malicious emails before they catch you. Analyze headers, links, and social cues.',
                difficulty: 1,
                xp: 60,
                component: 'PhishingModule',
                tags: ['Email', 'Social Engineering', 'URLs'],
            },
            {
                id: 'social',
                icon: '🕵️',
                badge: 'LEARN',
                title: 'Social Engineering',
                subtitle: 'Human Hacking Exposed',
                description: 'Discover how hackers exploit psychology, trust, and authority to bypass even the best technical defenses.',
                difficulty: 2,
                xp: 70,
                component: 'SocialModule',
                tags: ['Pretexting', 'Baiting', 'Vishing'],
            },
            {
                id: 'cia',
                icon: '🏛️',
                badge: 'LEARN',
                title: 'CIA Triad',
                subtitle: 'Foundations of Security',
                description: 'Understand Confidentiality, Integrity, and Availability — the three pillars every security professional lives by.',
                difficulty: 1,
                xp: 40,
                component: 'CIAModule',
                tags: ['CIA', 'InfoSec', 'Basics'],
            },
        ],
    },
    advanced: {
        label: '💀 Operator',
        sublabel: 'Elite Training',
        color: '#ff3366',
        glow: 'rgba(255,51,102,0.35)',
        modules: [
            {
                id: 'terminal',
                icon: '⚡',
                badge: 'SANDBOX',
                title: 'Kernel Sandbox',
                subtitle: 'Live Terminal Sim',
                description: 'Execute real-world recon commands in a simulated Linux environment. Explore files, processes, and network state.',
                difficulty: 4,
                xp: 150,
                component: 'TerminalModule',
                tags: ['Linux', 'Bash', 'Recon'],
            },
            {
                id: 'cipher',
                icon: '🔬',
                badge: 'VISUAL',
                title: 'Cipher Lab',
                subtitle: 'Encryption Visualizer',
                description: 'Watch Caesar, ROT13, and XOR ciphers transform your text in real-time. Then try to crack an intercepted message.',
                difficulty: 3,
                xp: 120,
                component: 'CipherModule',
                tags: ['Cryptography', 'AES', 'XOR'],
            },
            {
                id: 'network',
                icon: '📡',
                badge: 'ANALYSIS',
                title: 'Packet Inspector',
                subtitle: 'HEX Stream Decoder',
                description: 'Dissect raw TCP/IP packet streams layer by layer. Identify anomalies, ports, and protocol fingerprints.',
                difficulty: 5,
                xp: 180,
                component: 'NetworkModule',
                tags: ['TCP/IP', 'Wireshark', 'Packets'],
            },
            {
                id: 'sqlmap',
                icon: '💉',
                badge: 'CHALLENGE',
                title: 'SQLi Simulator',
                subtitle: 'Injection Playground',
                description: 'Test classic SQL injection payloads against a sandboxed vulnerable login. Learn UNION attacks and blind injection.',
                difficulty: 5,
                xp: 200,
                component: 'SQLiModule',
                tags: ['SQL', 'Injection', 'OWASP Top 10'],
            },
        ],
    },
};

/* ── STARS BACKGROUND ── */
const StarsBackground = () => {
    const stars = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
    }));
    return (
        <div className="lp-stars">
            {stars.map(s => (
                <div
                    key={s.id}
                    className="lp-star"
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: `${s.size}px`,
                        height: `${s.size}px`,
                        animationDelay: `${s.delay}s`,
                        animationDuration: `${s.duration}s`,
                    }}
                />
            ))}
        </div>
    );
};

/* ── XP BADGE ── */
const XPBadge = ({ xp }) => (
    <div className="lp-xp-badge">
        <span className="lp-xp-lightning">⚡</span>
        <span>{xp} XP</span>
    </div>
);

/* ── DIFFICULTY DOTS ── */
const DifficultyMeter = ({ level }) => (
    <div className="lp-difficulty">
        {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={`lp-diff-dot ${i < level ? 'active' : ''}`} />
        ))}
    </div>
);

/* ══════════════════════════════════════════════
   BEGINNER MODULES
══════════════════════════════════════════════ */

/* PASSWORD MODULE */
const PasswordModule = () => {
    const [pass, setPass] = useState('');
    const [strength, setStrength] = useState(0);
    const [checks, setChecks] = useState({ length: false, upper: false, number: false, symbol: false });
    const [crackTime, setCrackTime] = useState('Instant');

    const analyze = (val) => {
        setPass(val);
        const c = {
            length: val.length >= 12,
            upper: /[A-Z]/.test(val),
            number: /[0-9]/.test(val),
            symbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(val),
        };
        setChecks(c);
        const score = Object.values(c).filter(Boolean).length * 25;
        setStrength(score);
        if (score === 100) setCrackTime('~3.4 centuries');
        else if (score >= 75) setCrackTime('~2.3 years');
        else if (score >= 50) setCrackTime('~4 hours');
        else if (score >= 25) setCrackTime('~12 minutes');
        else setCrackTime('Instant');
    };

    const strengthLabel = strength === 100 ? 'CRYPTOGRAPHIC' : strength >= 75 ? 'STRONG' : strength >= 50 ? 'MODERATE' : strength >= 25 ? 'WEAK' : 'CRITICAL';
    const strengthColor = strength === 100 ? '#00cc66' : strength >= 75 ? '#66ff99' : strength >= 50 ? '#ffcc00' : strength >= 25 ? '#ff9900' : '#ff3366';

    return (
        <div className="lp-interactive-body">
            <div className="lp-pass-input-wrap">
                <span className="lp-pass-icon">🔑</span>
                <input
                    type="password"
                    className="lp-pass-input"
                    placeholder="Type your secret key..."
                    value={pass}
                    onChange={e => analyze(e.target.value)}
                />
            </div>
            <div className="lp-strength-bar-track">
                <div
                    className="lp-strength-bar-fill"
                    style={{ width: `${strength}%`, background: strengthColor, boxShadow: `0 0 12px ${strengthColor}` }}
                />
            </div>
            <div className="lp-strength-row">
                <span className="lp-strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
                <span className="lp-crack-time">⏱ Crack time: <b>{crackTime}</b></span>
            </div>
            <div className="lp-check-grid">
                {[
                    { key: 'length', label: '12+ Characters' },
                    { key: 'upper', label: 'Uppercase Letter' },
                    { key: 'number', label: 'Number Included' },
                    { key: 'symbol', label: 'Special Symbol' },
                ].map(({ key, label }) => (
                    <div key={key} className={`lp-check-item ${checks[key] ? 'pass' : 'fail'}`}>
                        <span>{checks[key] ? '✅' : '❌'}</span>
                        <span>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* PHISHING MODULE */
const PhishingModule = () => {
    const emails = [
        {
            from: 'secure-pay-apsit@support-live.tk',
            subject: 'URGENT: Your account has been compromised!',
            body: 'Dear User, Click here to verify your identity immediately or your account will be suspended.',
            red_flags: ['.tk TLD (high-risk)', 'Urgency language', 'Generic greeting', 'Suspicious link'],
            verdict: 'PHISHING',
        },
        {
            from: 'noreply@github.com',
            subject: 'Action required: Review a pending pull request',
            body: 'A collaborator has opened a pull request. Visit github.com/pulls to review it at your convenience.',
            red_flags: [],
            verdict: 'LEGITIMATE',
        },
        {
            from: 'support@paypa1-security.com',
            subject: 'Your payment failed — update billing now',
            body: 'We noticed your payment did not go through. Please click the link below to update your details.',
            red_flags: ['paypa1 (typosquat)', 'Fake urgency', 'Requests personal info'],
            verdict: 'PHISHING',
        },
    ];

    const [idx, setIdx] = useState(0);
    const [chosen, setChosen] = useState(null);
    const [score, setScore] = useState(0);
    const [done, setDone] = useState(false);
    const current = emails[idx];

    const answer = (verdict) => {
        setChosen(verdict);
        if (verdict === current.verdict) setScore(s => s + 1);
        setTimeout(() => {
            if (idx < emails.length - 1) {
                setIdx(i => i + 1);
                setChosen(null);
            } else {
                setDone(true);
            }
        }, 1800);
    };

    if (done) return (
        <div className="lp-quiz-done">
            <div className="lp-quiz-score">{score}/{emails.length}</div>
            <p>{score === emails.length ? "🏆 Perfect! You're phishing-proof." : score >= 2 ? '👍 Good instincts. Keep training.' : '⚠️ Stay alert — phishing is evolving.'}</p>
            <button className="lp-quiz-retry" onClick={() => { setIdx(0); setChosen(null); setScore(0); setDone(false); }}>Try Again</button>
        </div>
    );

    return (
        <div className="lp-interactive-body">
            <div className="lp-quiz-progress">
                <span>Email {idx + 1} of {emails.length}</span>
                <span>Score: {score}</span>
            </div>
            <div className="lp-email-card">
                <div className="lp-email-row"><span className="lp-email-label">FROM:</span><span className="lp-email-val">{current.from}</span></div>
                <div className="lp-email-row"><span className="lp-email-label">SUBJ:</span><span className="lp-email-val">{current.subject}</span></div>
                <div className="lp-email-body">{current.body}</div>
            </div>
            {chosen && (
                <div className={`lp-answer-reveal ${chosen === current.verdict ? 'correct' : 'wrong'}`}>
                    {chosen === current.verdict ? '✅ Correct!' : `❌ That was ${current.verdict}`}
                    {current.red_flags.length > 0 && (
                        <div className="lp-red-flags">
                            🚩 Red Flags: {current.red_flags.join(' · ')}
                        </div>
                    )}
                </div>
            )}
            {!chosen && (
                <div className="lp-verdict-btns">
                    <button className="lp-verdict-btn phishing" onClick={() => answer('PHISHING')}>🎣 PHISHING</button>
                    <button className="lp-verdict-btn legit" onClick={() => answer('LEGITIMATE')}>✅ LEGIT</button>
                </div>
            )}
        </div>
    );
};

/* SOCIAL ENGINEERING MODULE */
const SocialModule = () => {
    const attacks = [
        { name: 'Pretexting', icon: '🎭', desc: 'Attacker creates a fabricated scenario (pretext) — e.g., posing as IT support to extract your password.', color: '#a78bfa' },
        { name: 'Baiting', icon: '💿', desc: 'Leaving infected USB drives in parking lots. Curiosity kills the cat — and your network.', color: '#f59e0b' },
        { name: 'Vishing', icon: '📞', desc: 'Voice phishing over phone. "Hi, I\'m from your bank\'s fraud department..." Classic opener.', color: '#fb923c' },
        { name: 'Quid Pro Quo', icon: '🤝', desc: 'Offering a "free" service (fake IT help) in exchange for credentials. No such thing as free lunch.', color: '#34d399' },
        { name: 'Tailgating', icon: '🚪', desc: 'Physically following authorized personnel into restricted areas by acting casual or claiming forgotten ID.', color: '#60a5fa' },
    ];

    const [active, setActive] = useState(0);
    return (
        <div className="lp-interactive-body">
            <div className="lp-social-tabs">
                {attacks.map((a, i) => (
                    <button
                        key={a.name}
                        className={`lp-social-tab ${active === i ? 'active' : ''}`}
                        style={active === i ? { borderColor: a.color, color: a.color } : {}}
                        onClick={() => setActive(i)}
                    >
                        {a.icon}
                    </button>
                ))}
            </div>
            <div className="lp-social-detail" style={{ borderColor: attacks[active].color + '55' }}>
                <div className="lp-social-name" style={{ color: attacks[active].color }}>{attacks[active].icon} {attacks[active].name}</div>
                <p className="lp-social-desc">{attacks[active].desc}</p>
                <div className="lp-social-tip">💡 Defense: Verify identity through official channels before sharing anything.</div>
            </div>
        </div>
    );
};

/* CIA MODULE */
const CIAModule = () => {
    const pillars = [
        { label: 'Confidentiality', icon: '🔒', color: '#0066ff', desc: 'Only authorized parties can access data. Enforced via encryption, access control, and need-to-know policies.', example: 'AES-256 encrypted database at rest' },
        { label: 'Integrity', icon: '✅', color: '#00cc66', desc: 'Data must not be altered without authorization. Hashing and digital signatures ensure trustworthiness.', example: 'SHA-256 checksum for file verification' },
        { label: 'Availability', icon: '⚡', color: '#ffcc00', desc: 'Systems and data must be accessible when needed. Mitigates DDoS, hardware failure, and ransomware threats.', example: 'Load balancers + offsite backups' },
    ];
    const [active, setActive] = useState(0);
    return (
        <div className="lp-interactive-body">
            <div className="lp-cia-grid">
                {pillars.map((p, i) => (
                    <button
                        key={p.label}
                        className={`lp-cia-btn ${active === i ? 'active' : ''}`}
                        style={active === i ? { background: p.color + '22', borderColor: p.color, color: p.color } : {}}
                        onClick={() => setActive(i)}
                    >
                        <span>{p.icon}</span>
                        <span>{p.label}</span>
                    </button>
                ))}
            </div>
            <div className="lp-cia-detail" style={{ borderLeft: `3px solid ${pillars[active].color}` }}>
                <p>{pillars[active].desc}</p>
                <div className="lp-cia-example">
                    <span className="lp-cia-example-label">REAL EXAMPLE:</span>
                    <span>{pillars[active].example}</span>
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════
   ADVANCED MODULES
══════════════════════════════════════════════ */

/* TERMINAL MODULE */
const TerminalModule = () => {
    const COMMANDS = {
        help: () => ['Available commands:', '  ls        – list directory', '  whoami    – current user', '  ps aux    – running processes', '  netstat   – network connections', '  cat flag  – redeem your first flag', '  clear     – reset terminal'],
        ls: () => ['config.yaml  exploit.py  logs/  shadow.db  /var/www/html'],
        whoami: () => ['root@apsit-hive  [sudo]  UID=0'],
        'ps aux': () => ['PID  CMD', '1    init', '241  sshd', '512  nginx', '899  python3 exploit.py  ← 🚨 suspicious'],
        netstat: () => ['Proto  Local          Foreign        State', 'tcp    0.0.0.0:80     0.0.0.0:*      LISTEN', 'tcp    192.168.1.5   10.0.0.99:4444 ESTABLISHED  ← 🚨 C2 beacon?'],
        'cat flag': () => ['🏁 FLAG{apsit_h4ck3r_1n_th3_m4k1ng}', '╔══ First flag captured! +200 XP ══╗'],
        clear: () => null,
    };

    const [history, setHistory] = useState([
        { type: 'system', text: '┌─[APSIT CYBER RANGE v2.4.1]─────────────────────────┐' },
        { type: 'system', text: '│  Simulated Kali Linux terminal — sandbox mode        │' },
        { type: 'system', text: '│  Type "help" to see available commands               │' },
        { type: 'system', text: '└────────────────────────────────────────────────[OK]─┘' },
    ]);
    const [input, setInput] = useState('');
    const [cmdHistory, setCmdHistory] = useState([]);
    const [histIdx, setHistIdx] = useState(-1);
    const bottomRef = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);

    const run = useCallback(() => {
        if (!input.trim()) return;
        const cmd = input.trim();
        setCmdHistory(h => [cmd, ...h]);
        setHistIdx(-1);
        const fn = COMMANDS[cmd];
        const newLines = [{ type: 'cmd', text: `root@apsit:~# ${cmd}` }];
        if (fn) {
            const result = fn();
            if (result === null) {
                setHistory([{ type: 'system', text: '-- Terminal cleared --' }]);
                setInput('');
                return;
            }
            result.forEach(line => newLines.push({ type: 'out', text: line }));
        } else {
            newLines.push({ type: 'err', text: `bash: ${cmd}: command not found` });
        }
        setHistory(h => [...h, ...newLines]);
        setInput('');
    }, [input]);

    const onKey = (e) => {
        if (e.key === 'Enter') { run(); }
        else if (e.key === 'ArrowUp') {
            const ni = Math.min(histIdx + 1, cmdHistory.length - 1);
            setHistIdx(ni);
            setInput(cmdHistory[ni] ?? '');
        } else if (e.key === 'ArrowDown') {
            const ni = Math.max(histIdx - 1, -1);
            setHistIdx(ni);
            setInput(ni === -1 ? '' : cmdHistory[ni]);
        }
    };

    return (
        <div className="lp-terminal">
            <div className="lp-term-header">
                <div className="lp-term-dot red" />
                <div className="lp-term-dot yellow" />
                <div className="lp-term-dot green" />
                <span className="lp-term-title">root@apsit-cyber: ~/sandbox</span>
            </div>
            <div className="lp-term-body">
                {history.map((line, i) => (
                    <div key={i} className={`lp-term-line ${line.type}`}>{line.text}</div>
                ))}
                <div className="lp-term-input-row">
                    <span className="lp-term-prompt">root@apsit:~# </span>
                    <input
                        className="lp-term-input"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={onKey}
                        placeholder="type a command..."
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                    />
                </div>
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

/* CIPHER MODULE */
const CipherModule = () => {
    const [text, setText] = useState('');
    const [mode, setMode] = useState('caesar');
    const [shift, setShift] = useState(13);

    const ciphers = {
        caesar: (t) => t.split('').map(c => {
            if (/[a-z]/.test(c)) return String.fromCharCode(((c.charCodeAt(0) - 97 + shift) % 26) + 97);
            if (/[A-Z]/.test(c)) return String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65);
            return c;
        }).join(''),
        rot13: (t) => t.split('').map(c => {
            if (/[a-z]/.test(c)) return String.fromCharCode(((c.charCodeAt(0) - 97 + 13) % 26) + 97);
            if (/[A-Z]/.test(c)) return String.fromCharCode(((c.charCodeAt(0) - 65 + 13) % 26) + 65);
            return c;
        }).join(''),
        xor: (t) => t.split('').map(c => String.fromCharCode(c.charCodeAt(0) ^ 0x42)).join(''),
        base64: (t) => { try { return btoa(t); } catch { return '⚠ Invalid input'; } },
        hex: (t) => t.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '),
    };

    const output = text ? ciphers[mode](text) : '';

    return (
        <div className="lp-interactive-body">
            <div className="lp-cipher-tabs">
                {Object.keys(ciphers).map(k => (
                    <button key={k} className={`lp-cipher-tab ${mode === k ? 'active' : ''}`} onClick={() => setMode(k)}>
                        {k.toUpperCase()}
                    </button>
                ))}
            </div>
            {mode === 'caesar' && (
                <div className="lp-shift-row">
                    <label>Shift: <b>{shift}</b></label>
                    <input type="range" min={1} max={25} value={shift} onChange={e => setShift(Number(e.target.value))} className="lp-shift-range" />
                </div>
            )}
            <textarea
                className="lp-cipher-input"
                placeholder="Type plaintext here..."
                value={text}
                onChange={e => setText(e.target.value)}
                rows={2}
            />
            <div className="lp-cipher-arrow">▼ {mode.toUpperCase()} OUTPUT ▼</div>
            <div className="lp-cipher-output">{output || <span className="lp-cipher-placeholder">Ciphertext will appear here...</span>}</div>
        </div>
    );
};

/* NETWORK MODULE */
const NetworkModule = () => {
    const packets = [
        { id: '001', time: '0.000', src: '192.168.1.5', dst: '10.0.0.1', proto: 'TCP', info: 'SYN — Port 80 (HTTP)', suspicious: false },
        { id: '002', time: '0.012', src: '10.0.0.1', dst: '192.168.1.5', proto: 'TCP', info: 'SYN-ACK', suspicious: false },
        { id: '003', time: '0.021', src: '192.168.1.5', dst: '10.0.0.1', proto: 'TCP', info: 'ACK — 3-Way Handshake Complete ✅', suspicious: false },
        { id: '004', time: '1.432', src: '0.0.0.0', dst: '255.255.255.255', proto: 'ARP', info: 'Who has 192.168.1.1? ← ARP Poisoning?', suspicious: true },
        { id: '005', time: '1.440', src: '192.168.1.99', dst: '192.168.1.5', proto: 'ARP', info: 'Fake GW reply — MITM Attempt 🚨', suspicious: true },
        { id: '006', time: '2.100', src: '192.168.1.5', dst: '8.8.8.8', proto: 'DNS', info: 'Query: malware-c2.xyz ← 🚩 C2 Domain', suspicious: true },
    ];
    const [selected, setSelected] = useState(null);
    return (
        <div className="lp-interactive-body lp-network">
            <div className="lp-packet-table">
                <div className="lp-packet-header">
                    <span>No.</span><span>Time</span><span>Source</span><span>Protocol</span>
                </div>
                {packets.map(p => (
                    <div
                        key={p.id}
                        className={`lp-packet-row ${p.suspicious ? 'sus' : ''} ${selected?.id === p.id ? 'selected' : ''}`}
                        onClick={() => setSelected(selected?.id === p.id ? null : p)}
                    >
                        <span>{p.id}</span>
                        <span>{p.time}s</span>
                        <span className="lp-packet-src">{p.src}</span>
                        <span className={`lp-proto-badge ${p.proto.toLowerCase()}`}>{p.proto}</span>
                    </div>
                ))}
            </div>
            {selected && (
                <div className={`lp-packet-detail ${selected.suspicious ? 'sus' : 'clean'}`}>
                    <div className="lp-packet-detail-row"><b>SRC:</b> {selected.src} → <b>DST:</b> {selected.dst}</div>
                    <div className="lp-packet-detail-row"><b>INFO:</b> {selected.info}</div>
                    {selected.suspicious && <div className="lp-packet-alert">🚨 Anomaly Detected — Possible Attack</div>}
                </div>
            )}
        </div>
    );
};

/* SQLi MODULE */
const SQLiModule = () => {
    const PAYLOADS = {
        "' OR '1'='1": { success: true, msg: "Auth bypass! Returned all rows. Classic UNION vulnerability.", rows: ["admin | hash_abc123", "alice | hash_def456", "bob | hash_ghi789"] },
        "admin'--": { success: true, msg: "Comment injection! -- terminates the query, bypassing password check.", rows: ["admin | (password ignored)"] },
        "' OR 1=1--": { success: true, msg: "Boolean injection! Always-true condition grants access.", rows: ["All 47 users returned!"] },
        "' DROP TABLE users--": { success: false, msg: "❌ Blocked by WAF (Web Application Firewall) — DDL statements filtered.", rows: [] },
        "admin": { success: false, msg: "Auth failed. Normal login — no injection detected.", rows: [] },
    };

    const [payload, setPayload] = useState('');
    const [result, setResult] = useState(null);

    const inject = () => {
        const found = PAYLOADS[payload.trim()];
        if (found) setResult(found);
        else setResult({ success: false, msg: 'Query returned no results. Try a known payload.', rows: [] });
    };

    return (
        <div className="lp-interactive-body">
            <div className="lp-sqli-db">
                <span className="lp-sqli-db-label">Target: </span>
                <code className="lp-sqli-db-name">apsit_users.db</code>
                <span className="lp-sqli-db-badge">VULNERABLE</span>
            </div>
            <div className="lp-sqli-query">
                <code>SELECT * FROM users WHERE username='<span className="lp-sqli-inject">{payload || '...'}</span>' AND password='***'</code>
            </div>
            <div className="lp-sqli-hints">
                Try: {Object.keys(PAYLOADS).slice(0, 3).map(p => (
                    <button key={p} className="lp-sqli-hint-btn" onClick={() => setPayload(p)}>{p}</button>
                ))}
            </div>
            <div className="lp-sqli-input-row">
                <input
                    className="lp-sqli-input"
                    placeholder="Enter payload..."
                    value={payload}
                    onChange={e => setPayload(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && inject()}
                />
                <button className="lp-sqli-fire" onClick={inject}>💉 INJECT</button>
            </div>
            {result && (
                <div className={`lp-sqli-result ${result.success ? 'success' : 'fail'}`}>
                    <div className="lp-sqli-msg">{result.success ? '🔓 BREACH SUCCESSFUL' : '🔒 INJECTION FAILED'}</div>
                    <p>{result.msg}</p>
                    {result.rows.length > 0 && (
                        <div className="lp-sqli-rows">
                            {result.rows.map((r, i) => <div key={i} className="lp-sqli-row-item">{r}</div>)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════
   MODULE CARD
══════════════════════════════════════════════ */
const COMPONENT_MAP = {
    PasswordModule, PhishingModule, SocialModule, CIAModule,
    TerminalModule, CipherModule, NetworkModule, SQLiModule,
};

const ModuleCard = ({ module, accentColor, glowColor }) => {
    const [expanded, setExpanded] = useState(false);
    const Comp = COMPONENT_MAP[module.component];

    return (
        <div className={`lp-module-card ${expanded ? 'expanded' : ''}`} style={{ '--glow': glowColor, '--accent': accentColor }}>
            {/* Glassmorphism inner shine */}
            <div className="lp-card-shine" />

            <div className="lp-card-top">
                <div className="lp-card-icon-wrap">
                    <span className="lp-card-icon">{module.icon}</span>
                </div>
                <div className="lp-card-meta">
                    <span className="lp-card-badge" style={{ background: accentColor + '22', color: accentColor, borderColor: accentColor + '55' }}>
                        {module.badge}
                    </span>
                    <XPBadge xp={module.xp} />
                </div>
            </div>

            <h3 className="lp-card-title">{module.title}</h3>
            <p className="lp-card-subtitle">{module.subtitle}</p>
            <p className="lp-card-desc">{module.description}</p>

            <div className="lp-card-footer">
                <div className="lp-card-tags">
                    {module.tags.map(t => <span key={t} className="lp-card-tag">{t}</span>)}
                </div>
                <div className="lp-card-footer-right">
                    <DifficultyMeter level={module.difficulty} />
                    <button
                        className="lp-expand-btn"
                        style={{ borderColor: accentColor, color: accentColor }}
                        onClick={() => setExpanded(e => !e)}
                    >
                        {expanded ? '▲ Close' : '▶ Launch'}
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="lp-module-body">
                    <div className="lp-module-body-inner">
                        <Comp />
                    </div>
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
const Learning = () => {
    const [activeTab, setActiveTab] = useState('beginner');
    const tree = SKILL_TREES[activeTab];

    return (
        <div className="lp-root">
            <StarsBackground />

            {/* Ambient glow orbs */}
            <div className="lp-orb lp-orb-1" />
            <div className="lp-orb lp-orb-2" />

            {/* HERO HEADER */}
            <header className="lp-hero">
                <div className="lp-hero-badge">
                    <span className="lp-hero-dot" />
                    APSIT CYBER RANGE · ACTIVE
                </div>
                <h1 className="lp-hero-title">
                    <span className="lp-hero-title-line1">CYBER</span>
                    <span className="lp-hero-title-line2">ACADEMY</span>
                </h1>
                <p className="lp-hero-sub">
                    Hands-on intelligence modules for the next generation of security operators.
                    <br />From zero-day novice to elite threat hunter.
                </p>
                <div className="lp-hero-stats">
                    <div className="lp-stat"><b>8</b><span>Modules</span></div>
                    <div className="lp-stat-divider" />
                    <div className="lp-stat"><b>820</b><span>XP Available</span></div>
                    <div className="lp-stat-divider" />
                    <div className="lp-stat"><b>100%</b><span>Interactive</span></div>
                </div>
            </header>

            {/* SKILL TREE TABS */}
            <div className="lp-tabs-wrapper">
                <div className="lp-tabs">
                    {Object.entries(SKILL_TREES).map(([key, val]) => (
                        <button
                            key={key}
                            className={`lp-tab ${activeTab === key ? 'active' : ''}`}
                            style={activeTab === key ? { '--tab-color': val.color, '--tab-glow': val.glow } : {}}
                            onClick={() => setActiveTab(key)}
                        >
                            <span className="lp-tab-label">{val.label}</span>
                            <span className="lp-tab-sub">{val.sublabel}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* SECTION LABEL */}
            <div className="lp-section-label" style={{ '--sc': tree.color }}>
                <div className="lp-section-line" style={{ background: tree.color }} />
                <span>{tree.label} — {tree.modules.length} Modules</span>
                <div className="lp-section-line" style={{ background: tree.color }} />
            </div>

            {/* MODULE GRID */}
            <div className="lp-grid">
                {tree.modules.map(mod => (
                    <ModuleCard
                        key={mod.id}
                        module={mod}
                        accentColor={tree.color}
                        glowColor={tree.glow}
                    />
                ))}
            </div>

            {/* FOOTER CTA */}
            <div className="lp-footer-cta">
                <div className="lp-cta-card">
                    <span className="lp-cta-icon">🚀</span>
                    <h3>Ready for real challenges?</h3>
                    <p>Join CTF competitions hosted by APSIT Cyber Chapter and put your skills to the ultimate test.</p>
                    <a href="https://ctftime.org" target="_blank" rel="noopener noreferrer" className="lp-cta-btn">
                        Explore CTF Challenges →
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Learning;
