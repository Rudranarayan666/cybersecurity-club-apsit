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
            </div>

            {/* scroll indicator */}
            <div className="scroll-indicator">
                <i className="fa-solid fa-chevron-down" />
            </div>
        </section>
    );
};

export default HeroSection;
