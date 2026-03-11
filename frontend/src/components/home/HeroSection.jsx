import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TYPEWRITER_WORDS = ['HACKERS', 'BUILDERS', 'PIONEERS', 'DEFENDERS', 'ENGINEERS'];

const HeroSection = () => {
    const [twIndex, setTwIndex] = useState(0);
    const [twText, setTwText] = useState('');
    const [twDeleting, setTwDeleting] = useState(false);
    const [mounted, setMounted] = useState(false);

    const figureRef = useRef(null);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        let ctx = gsap.context(() => {
            if (figureRef.current) {
                const isMobile = window.innerWidth <= 640;

                // The ThreeCanvas heroPlane scales natively with the scroll.
                // We want this DOM image to move to the exact center of the viewport,
                // shrink slightly, and then fade out just as the 3D canvas takes over its role completely.
                gsap.to(figureRef.current, {
                    scrollTrigger: {
                        trigger: "#home",
                        start: "top top",
                        end: "bottom top", // Matches the ThreeCanvas phase 1 scroll range
                        scrub: 1,
                    },
                    // Move EXACTLY to the absolute center of the viewport regardless of CSS layout
                    x: () => {
                        if (!figureRef.current) return 0;
                        const rect = figureRef.current.getBoundingClientRect();
                        return (window.innerWidth / 2) - (rect.left + rect.width / 2);
                    },
                    y: () => {
                        if (!figureRef.current) return 0;
                        const rect = figureRef.current.getBoundingClientRect();
                        // It must travel the distance to center PLUS counteract the scrolling container's upward movement.
                        // Since 'end' is 'bottom top', the container will move UP by window.innerHeight.
                        const scrollDistance = window.innerHeight;
                        return (window.innerHeight / 2) - (rect.top + rect.height / 2) + scrollDistance;
                    },
                    scale: 0.8, // Match the initial visual size of the Three.js heroPlane
                    opacity: 0, // Crossfade perfectly as the 3D plane stays visible 
                    ease: "power2.inOut",
                });
            }
        });
        return () => ctx.revert();
    }, []);

    useEffect(() => {
        const word = TYPEWRITER_WORDS[twIndex];
        let timeout;
        if (!twDeleting && twText.length < word.length) {
            timeout = setTimeout(() => setTwText(word.slice(0, twText.length + 1)), 90);
        } else if (!twDeleting && twText.length === word.length) {
            timeout = setTimeout(() => setTwDeleting(true), 1900);
        } else if (twDeleting && twText.length > 0) {
            timeout = setTimeout(() => setTwText(twText.slice(0, -1)), 55);
        } else {
            setTwDeleting(false);
            setTwIndex(i => (i + 1) % TYPEWRITER_WORDS.length);
        }
        return () => clearTimeout(timeout);
    }, [twText, twDeleting, twIndex]);

    const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    return (
        <>
            <section id="home" className="hs">

                {/* Backgrounds */}
                <div className="hs-bg" />
                <div className="hs-grid-overlay" />
                <div className="hs-glow hs-g1" />
                <div className="hs-glow hs-g2" />

                {/* Watermark */}
                <div className="hs-watermark" aria-hidden>CYBER<br />GUARDIAN</div>

                {/* ── Main layout ── */}
                <div className="hs-layout">

                    {/* LEFT / TOP — text */}
                    <div className={`hs-col-text ${mounted ? 'hs-in' : ''}`}>

                        <div className="hs-badge">
                            <span className="hs-dot" />
                            APSIT · CYBERSEC CLUB · ONLINE
                        </div>

                        <p className="hs-label">WE ARE</p>

                        {/*
                          IMPORTANT: min-height prevents layout shift while typewriter types.
                          The heading always occupies exactly 1 line of space even when empty.
                        */}
                        <h1 className="hs-heading">
                            {/* Reserve the width of the longest word so siblings don't shift */}
                            <span className="hs-tw-reserve" aria-hidden>DEFENDERS</span>
                            <span className="hs-tw-live">
                                {twText}<span className="hs-caret">|</span>
                            </span>
                        </h1>

                        <p className="hs-sub">
                            Cybersecurity Club at APSIT — building elite defenders, one exploit at a time.
                        </p>

                        <div className="hs-btns">
                            <button className="hs-btn-primary" onClick={() => scrollTo('events')}>
                                <i className="fa-solid fa-shield-halved" /> Explore Events
                            </button>
                            <button className="hs-btn-ghost" onClick={() => scrollTo('learn')}>
                                <i className="fa-solid fa-terminal" /> Start Learning
                            </button>
                        </div>

                        <div className="hs-tags">
                            {['CTF', 'PENTESTING', 'OSINT', 'FORENSICS', 'CRYPTOGRAPHY'].map(t => (
                                <span key={t} className="hs-tag">{t}</span>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT / BOTTOM — figure */}
                    <div className="hs-col-fig">
                        <img ref={figureRef} src="/hero-figure.png" alt="Cyber Guardian" className="hs-figure" />
                    </div>
                </div>

                <div className="scroll-indicator" style={{ zIndex: 30, opacity: 1 }}>
                    <i className="fa-solid fa-chevron-down" />
                </div>
            </section>

            <style>{`
/* ═══════════════════════════════
   HERO ROOT
═══════════════════════════════ */
.hs {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: stretch;
    padding-top: 80px;          /* navbar */
}

/* ─── Backgrounds ─── */
.hs-bg {
    position: absolute; inset: 0; z-index: 0;
    background: linear-gradient(155deg, #020a14 0%, #050e1e 55%, #030c18 100%);
}
.hs-grid-overlay {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background-image:
        linear-gradient(rgba(0,102,255,.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,102,255,.03) 1px, transparent 1px);
    background-size: 52px 52px;
    mask-image: radial-gradient(ellipse 100% 100% at 50% 50%, black 35%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 100% 100% at 50% 50%, black 35%, transparent 100%);
}
.hs-glow {
    position: absolute; z-index: 1; border-radius: 50%;
    pointer-events: none; filter: blur(80px);
    animation: hsGlow 8s ease-in-out infinite;
}
.hs-g1 {
    top: -10%; right: -8%;
    width: 55vw; height: 55vw; max-width: 800px; max-height: 800px;
    background: radial-gradient(circle, rgba(0,80,200,.13) 0%, transparent 70%);
}
.hs-g2 {
    bottom: -20%; left: -5%;
    width: 40vw; height: 40vw; max-width: 500px; max-height: 500px;
    background: radial-gradient(circle, rgba(0,130,220,.08) 0%, transparent 70%);
    animation-delay: 4s;
}

/* ─── Watermark ─── */
.hs-watermark {
    position: absolute; inset: 0; z-index: 2;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Space Grotesk', sans-serif; font-weight: 900;
    font-size: clamp(3rem, 14vw, 13rem);
    line-height: .88; text-align: center;
    background: linear-gradient(180deg, rgba(255,255,255,.045) 0%, rgba(0,100,255,.025) 100%);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
    pointer-events: none; user-select: none; white-space: pre;
}

/* ═══════════════════════════════
   DESKTOP LAYOUT (> 640px)
   Two-column grid
═══════════════════════════════ */
.hs-layout {
    position: relative; z-index: 10;
    width: 100%; max-width: 1500px; margin: 0 auto;
    padding: 0 clamp(2rem, 5vw, 5rem);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    align-items: center;
    min-height: calc(100vh - 80px);
}

/* ─── LEFT: text ─── */
.hs-col-text {
    padding-right: 2rem;
    opacity: 0; transform: translateY(24px);
    transition: opacity .9s ease .1s, transform .9s ease .1s;
}
.hs-col-text.hs-in { opacity: 1; transform: none; }

.hs-badge {
    display: inline-flex; align-items: center; gap: .5rem;
    padding: .38rem 1rem;
    background: rgba(0,194,255,.06); border: 1px solid rgba(0,194,255,.2);
    border-radius: 999px; width: fit-content;
    font-family: 'Courier New', monospace;
    font-size: clamp(.56rem, .9vw, .68rem);
    letter-spacing: 1.8px; color: #67e8f9; text-transform: uppercase;
    margin-bottom: 1.5rem;
}
.hs-dot {
    width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
    background: #4ade80; box-shadow: 0 0 8px #4ade80;
    animation: hsDot 2s ease-in-out infinite;
}

.hs-label {
    font-family: 'Space Grotesk', sans-serif; font-weight: 600;
    font-size: clamp(.8rem, 1.1vw, 1rem);
    letter-spacing: .55em; color: #3d5070;
    text-transform: uppercase; margin: 0 0 .3rem;
}

/* ── Heading: NO layout shift ──
   Uses a hidden 'reserve' span to hold the max width,
   and live span absolutely overlaid on top.
   The container height is always 1 line tall.
*/
.hs-heading {
    position: relative;
    font-family: 'Space Grotesk', sans-serif; font-weight: 900;
    font-size: clamp(3rem, 6.5vw, 7rem);
    line-height: 1.0;
    letter-spacing: -2px;
    margin: 0 0 1.4rem;
    white-space: nowrap;
}
/* Ghost span — invisible, just reserves the height & stops layout shift */
.hs-tw-reserve {
    visibility: hidden;
    background: linear-gradient(135deg, #fff 0%, #5ba8ff 40%, #00c2ff 100%);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
}
/* Live typed text — sits absolutely over the reserve span */
.hs-tw-live {
    position: absolute; left: 0; top: 0;
    background: linear-gradient(135deg, #fff 0%, #5ba8ff 40%, #00c2ff 100%);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
}
.hs-caret {
    -webkit-text-fill-color: #0066ff;
    animation: hsBlink 1s step-end infinite;
}

.hs-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(.9rem, 1.3vw, 1.1rem);
    line-height: 1.8; color: rgba(148,163,184,.82);
    margin: 0 0 2rem; max-width: 460px;
}

.hs-btns {
    display: flex; gap: .9rem; flex-wrap: wrap;
    margin-bottom: 2rem; align-items: center;
}
.hs-btn-primary {
    display: inline-flex; align-items: center; gap: .5rem;
    padding: .88rem 2rem;
    background: #fff; color: #08101e;
    border: none; border-radius: 5px;
    font-family: 'Space Grotesk', sans-serif; font-weight: 800;
    font-size: clamp(.75rem, 1.1vw, .88rem); letter-spacing: 1.5px;
    text-transform: uppercase; cursor: pointer;
    box-shadow: 0 4px 24px rgba(255,255,255,.1);
    transition: transform .25s, box-shadow .25s;
}
.hs-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 35px rgba(255,255,255,.18); }

.hs-btn-ghost {
    display: inline-flex; align-items: center; gap: .5rem;
    padding: .88rem 1.8rem;
    background: transparent; color: rgba(255,255,255,.6);
    border: 1px solid rgba(255,255,255,.18); border-radius: 5px;
    font-family: 'Courier New', monospace; font-weight: 600;
    font-size: clamp(.7rem, 1vw, .82rem); letter-spacing: 1.5px;
    text-transform: uppercase; cursor: pointer; transition: all .25s;
}
.hs-btn-ghost:hover { border-color: #0066ff; color: #fff; }

.hs-tags { display: flex; flex-wrap: wrap; gap: .4rem; }
.hs-tag {
    font-family: 'Courier New', monospace;
    font-size: clamp(.52rem, .8vw, .63rem);
    color: rgba(100,130,180,.4); letter-spacing: 1.2px;
    text-transform: uppercase; padding: .2rem .55rem;
    border: 1px solid rgba(100,130,180,.13); border-radius: 2px;
}

/* ─── RIGHT: figure ─── */
.hs-col-fig {
    position: relative;
    top: -100px;
    display: flex; align-items: flex-end; justify-content: center;
    height: calc(100vh - 80px);
    /* Overflow into gutter to make figure feel larger */
    margin-right: clamp(-3rem, -5vw, -1rem);
}
.hs-figure {
    width: 100%; height: 100%;
    object-fit: contain; object-position: bottom center;
    max-width: 550px;
    /* No blue glow — clean appearance */
    filter: none;
    mask-image: linear-gradient(to top, black 40%, rgba(0,0,0,.65) 68%, transparent 100%);
    -webkit-mask-image: linear-gradient(to top, black 40%, rgba(0,0,0,.65) 68%, transparent 100%);
    animation: hsFloat 6s ease-in-out infinite;
}

/* ═══════════════════════════════
   TABLET  641px – 1024px
═══════════════════════════════ */
@media (min-width: 641px) and (max-width: 1024px) {
    .hs { min-height: calc(100vh - 100px); }
    .hs-layout { padding: 0 2.5rem; gap: 1rem; min-height: calc(100vh - 180px); }
    .hs-heading { font-size: clamp(2.4rem, 5.5vw, 5rem); }
    .hs-col-fig { max-height: 600px; height: calc(100vh - 180px); }
    .hs-figure { max-width: 500px; }
}

/* ═══════════════════════════════
   MOBILE  ≤ 640px
   Figure: absolute full-screen background
   Text: centred, pinned to the bottom
═══════════════════════════════ */
@media (max-width: 640px) {
    /* Section fills the full viewport and acts as the positioning context */
    .hs {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 100vh;
        overflow: clip;
    }

    /* Layout wrapper: just a centred text block at the bottom */
    .hs-layout {
        display: block;
        position: relative;
        z-index: 20;                 /* on top of the figure */
        padding: 0 1.5rem;
        min-height: 0;
    }

    /* ── Figure: absolute, covers the entire section ── */
    .hs-col-fig {
        position: absolute;
        top: -100px; right: 0; bottom: 0; left: 0; 
        height: 100%;
        max-height: none;
        z-index: 5;                  /* behind text */
        pointer-events: none;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        margin: 0;
        width: 100%;
    }
    .hs-figure {
        width: 100%;
        height: 180%;
        /* re-centre after scaling out */
        max-width: none;
        object-fit: contain;
        object-position: bottom center;
        opacity: .6;
        mask-image: linear-gradient(to top, black 35%, rgba(0,0,0,.5) 62%, transparent 100%);
        -webkit-mask-image: linear-gradient(to top, black 35%, rgba(0,0,0,.5) 62%, transparent 100%);
        animation: hsFloatMobile 6s ease-in-out infinite;
    }

    /* ── Text column: centred, on top of figure, spread evenly ── */
    .hs-col-text {
        position: relative;
        z-index: 20;
        padding-right: 0;
        padding: 5rem 1.5rem 3rem;   /* top/bottom breathing room */
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        min-height: 100vh;           /* fill full viewport so items spread */
    }

    .hs-badge { font-size: .58rem; }

    .hs-label {
        letter-spacing: .45em;
        color: rgba(255,255,255,.5);
        font-size: .78rem;
    }

    /* Heading: large, white, no gradient (gradient invisible over figure) */
    .hs-heading {
        font-size: clamp(3rem, 14vw, 5rem);
        white-space: normal;
        letter-spacing: -1px;
        text-align: center;
        margin-bottom: 1rem;
    }
    .hs-tw-reserve { display: none; }
    .hs-tw-live {
        position: static;
        display: block;
        background: none;
        -webkit-text-fill-color: #fff;
        text-shadow: 0 2px 20px rgba(0,0,0,.95), 0 0 50px rgba(0,0,0,.8);
    }
    .hs-caret { -webkit-text-fill-color: #4fa3ff; }

    .hs-sub {
        font-size: clamp(.88rem, 4.5vw, 1.05rem);
        color: rgba(255,255,255,.82);
        text-shadow: 0 1px 10px rgba(0,0,0,.9);
        max-width: 100%;
        text-align: center;
        margin-bottom: 1.5rem;
    }

    .hs-btns {
        flex-direction: column;
        align-items: stretch;
        gap: .65rem;
        width: 100%;
    }
    .hs-btn-primary, .hs-btn-ghost { justify-content: center; }
    .hs-btn-ghost { color: rgba(255,255,255,.75); border-color: rgba(255,255,255,.22); }

    .hs-tags { justify-content: center; margin-top: 1rem; }

    /* Watermark smaller */
    .hs-watermark {
        font-size: clamp(2.5rem, 16vw, 3.5rem);
        white-space: normal; padding: 0 .5rem;
    }
}

/* ═══════════════════════════════
   ANIMATIONS
═══════════════════════════════ */
@keyframes hsGlow {
    0%, 100% { opacity: .65; }
    50%       { opacity: 1;   }
}
@keyframes hsFloat {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-16px); }
}
@keyframes hsFloatMobile {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-10px); }
}
@keyframes hsDot {
    0%, 100% { transform: scale(1);   opacity: 1;  }
    50%       { transform: scale(1.6); opacity: .4; }
}
@keyframes hsBlink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
}
            `}</style>
        </>
    );
};

export default HeroSection;
