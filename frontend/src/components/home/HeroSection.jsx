import React, { useEffect, useRef, useState } from 'react';

const CYBER_TAGS = [
    'CTF', 'PENTESTING', 'OSINT', 'FORENSICS', 'CRYPTOGRAPHY',
    'SQL INJECTION', 'XSS', 'ZERO-DAY', 'MALWARE', 'REVERSE ENG.',
    'NETWORK SEC.', 'STEGANOGRAPHY', 'BURP SUITE', 'KALI LINUX', 'WIRESHARK',
];

const TYPEWRITER_WORDS = ['DEFENDERS', 'HACKERS', 'INNOVATORS', 'ENGINEERS'];

const HeroSection = () => {
    const [twIndex, setTwIndex] = useState(0);
    const [twText, setTwText] = useState('');
    const [twDeleting, setTwDeleting] = useState(false);
    const [counter, setCounter] = useState({ members: 0, resources: 0, events: 0 });
    const counterDone = useRef(false);
    const heroRef = useRef(null);

    /* typewriter effect */
    useEffect(() => {
        const word = TYPEWRITER_WORDS[twIndex];
        let timeout;
        if (!twDeleting && twText.length < word.length) {
            timeout = setTimeout(() => setTwText(word.slice(0, twText.length + 1)), 95);
        } else if (!twDeleting && twText.length === word.length) {
            timeout = setTimeout(() => setTwDeleting(true), 1800);
        } else if (twDeleting && twText.length > 0) {
            timeout = setTimeout(() => setTwText(twText.slice(0, -1)), 50);
        } else if (twDeleting && twText.length === 0) {
            setTwDeleting(false);
            setTwIndex((twIndex + 1) % TYPEWRITER_WORDS.length);
        }
        return () => clearTimeout(timeout);
    }, [twText, twDeleting, twIndex]);

    /* counter animation on mount */
    useEffect(() => {
        if (counterDone.current) return;
        counterDone.current = true;
        const targets = { members: 500, resources: 50, events: 12 };
        const duration = 2000;
        const steps = 60;
        let step = 0;
        const interval = setInterval(() => {
            step++;
            const progress = Math.min(step / steps, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCounter({
                members: Math.round(targets.members * ease),
                resources: Math.round(targets.resources * ease),
                events: Math.round(targets.events * ease),
            });
            if (step >= steps) clearInterval(interval);
        }, duration / steps);
        return () => clearInterval(interval);
    }, []);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section id="home" className="hero" ref={heroRef} style={{ position: 'relative', overflow: 'hidden' }}>

            {/* ── Floating cyber tags ── */}
            <div className="cyber-float-tags" aria-hidden="true">
                {CYBER_TAGS.map((tag, i) => (
                    <span
                        key={tag}
                        className="cyber-float-tag"
                        style={{ '--delay': `${(i * 0.7) % 8}s`, '--x': `${(i * 6.4) % 100}%` }}
                    >
                        {tag}
                    </span>
                ))}
            </div>

            {/* ── Pulse rings ── */}
            <div className="hero-pulse-ring" style={{ '--size': '300px', '--delay': '0s' }} aria-hidden="true" />
            <div className="hero-pulse-ring" style={{ '--size': '550px', '--delay': '1.2s' }} aria-hidden="true" />
            <div className="hero-pulse-ring" style={{ '--size': '800px', '--delay': '2.4s' }} aria-hidden="true" />

            {/* ── Scanline overlay ── */}
            <div className="hero-scanlines" aria-hidden="true" />

            {/* ── Main Content ── */}
            <div className="hero-center">

                {/* Status badge */}
                <div className="hero-status-badge">
                    <span className="hero-status-dot" />
                    <span className="hero-status-code">APSIT.CYBERSEC &nbsp;·&nbsp; SYSTEM ONLINE</span>
                </div>

                {/* Main heading */}
                <h1 className="hero-headline">
                    <span className="hero-line-1">
                        <span className="hero-word-we">WE ARE</span>
                    </span>
                    <span className="hero-line-2">
                        <span className="hero-word-type">{twText}</span><span className="hero-cursor">|</span>
                    </span>
                    <span className="hero-line-3">
                        <span className="hero-word-of">OF THE</span>&nbsp;
                        <span className="hero-word-digital">DIGITAL</span>&nbsp;
                        <span className="hero-word-realm">FRONTIER</span>
                    </span>
                </h1>

                {/* Sub description */}
                <p className="hero-sub">
                    <span className="hero-sub-line">
                        <i className="fa-solid fa-lock hero-sub-icon" />
                        Cybersecurity Club &nbsp;·&nbsp; APSIT — Building security professionals,
                    </span>
                    <span className="hero-sub-accent"> one exploit at a time.</span>
                </p>

                {/* CTA Buttons */}
                <div className="hero-cta-row">
                    <button className="hero-btn-primary" onClick={() => scrollTo('events')}>
                        <span className="hero-btn-glow" />
                        <i className="fa-solid fa-shield-halved" />
                        <span>Join Operations</span>
                        <i className="fa-solid fa-arrow-right hero-btn-arrow" />
                    </button>
                    <button className="hero-btn-secondary" onClick={() => scrollTo('learn')}>
                        <i className="fa-solid fa-terminal" />
                        <span>Start Learning</span>
                    </button>
                </div>

                {/* Stats row */}
                <div className="hero-stats">
                    {[
                        { value: counter.members + '+', label: 'Members', icon: 'fa-solid fa-users' },
                        { value: counter.resources + '+', label: 'Resources', icon: 'fa-solid fa-book-open' },
                        { value: counter.events + '+', label: 'Events', icon: 'fa-solid fa-calendar-check' },
                    ].map(s => (
                        <div key={s.label} className="hero-stat-item">
                            <i className={s.icon + ' hero-stat-icon'} />
                            <span className="hero-stat-value">{s.value}</span>
                            <span className="hero-stat-label">{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* scroll indicator */}
            <div className="scroll-indicator">
                <i className="fa-solid fa-chevron-down" />
            </div>
        </section>
    );
};

export default HeroSection;
