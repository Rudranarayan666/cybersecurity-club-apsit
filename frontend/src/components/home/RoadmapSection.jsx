import React, { useEffect, useRef, useState } from 'react';
import VanillaTilt from 'vanilla-tilt';

const RoadmapSection = () => {
    const roadmapRef = useRef(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    useEffect(() => {
        if (roadmapRef.current) {
            VanillaTilt.init(roadmapRef.current, {
                max: 8,
                speed: 300,
                glare: true,
                'max-glare': 0.5,
            });
        }
        return () => {
            if (roadmapRef.current && roadmapRef.current.vanillaTilt) {
                roadmapRef.current.vanillaTilt.destroy();
            }
        };
    }, []);

    const openLightbox = () => {
        setIsLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
        document.body.style.overflow = '';
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <section id="learn" className="section-wrapper">
            <div className="section-header">
                <h2 className="section-title gradient-text">Learning <span>Roadmap</span></h2>
                <p className="section-subtitle">A structured path from novice to cyber-operative.</p>
            </div>

            <div className="timeline-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem' }}>
                <div className="timeline-bg"></div>
                <div style={{ position: 'relative', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
                    <img
                        ref={roadmapRef}
                        src="/images/Roadmap.png"
                        alt="Learning Roadmap"
                        id="roadmapThumbnail"
                        className="interactive-roadmap hover-trigger"
                        onClick={openLightbox}
                        style={{ cursor: 'zoom-in' }}
                    />
                    <div style={{
                        position: 'absolute', bottom: '-30px', width: '100%', textAlign: 'center',
                        color: 'var(--accent-primary)', fontSize: '0.9rem', pointerEvents: 'none', animation: 'pulse 2s infinite'
                    }}>
                        <i className="fa-solid fa-magnifying-glass-plus"></i> Click to enlarge
                    </div>
                </div>
            </div>

            <h3 style={{ margin: '2rem 0', fontFamily: 'var(--font-head)', fontSize: '2rem', textAlign: 'center' }}>
                Skill <span>Trees</span>
            </h3>
            <div className="grid">
                <div className="card hover-trigger" style={{ borderTop: '4px solid var(--accent-success)' }}>
                    <h3><i className="fa-solid fa-seedling"></i> Beginner</h3>
                    <ul className="skill-list">
                        {['Network Fundamentals', 'Security Principles (CIA)', 'Basic Cryptography', 'Introduction to Linux', 'Basics of Web Security'].map(skill => (
                            <li key={skill}><i className="fa-solid fa-check"></i> {skill}</li>
                        ))}
                    </ul>
                </div>

                <div className="card hover-trigger" style={{ borderTop: '4px solid var(--accent-secondary)' }}>
                    <h3><i className="fa-solid fa-layer-group"></i> Intermediate</h3>
                    <ul className="skill-list">
                        {['Vulnerability Assessment', 'Penetration Testing', 'Web Application Security', 'Wireless Security', 'Ethical Hacking'].map(skill => (
                            <li key={skill}><i className="fa-solid fa-check"></i> {skill}</li>
                        ))}
                    </ul>
                </div>

                <div className="card hover-trigger" style={{ borderTop: '4px solid var(--accent-alert)' }}>
                    <h3><i className="fa-solid fa-crosshairs"></i> Advanced</h3>
                    <ul className="skill-list">
                        {['Malware Analysis', 'Reverse Engineering', 'Threat Hunting', 'Cloud Security (AWS/Azure)', 'Zero-Day Research'].map(skill => (
                            <li key={skill}><i className="fa-solid fa-check"></i> {skill}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {isLightboxOpen && (
                <div className="roadmap-lightbox show" onClick={closeLightbox}>
                    <button className="close-lightbox" onClick={closeLightbox}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <div className="lightbox-img-container" onClick={(e) => e.stopPropagation()}>
                        <img src="/images/Roadmap.png" alt="Learning Roadmap Full" className="lightbox-img" />
                    </div>
                    <div className="roadmap-hint">[ CLICK ANYWHERE TO CLOSE ]</div>
                </div>
            )}
        </section>
    );
};

export default RoadmapSection;
