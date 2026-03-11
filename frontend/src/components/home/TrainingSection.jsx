import React from 'react';

const TrainingSection = () => {
    const platformsLeft = [
        { name: 'TryHackMe', color: '#ff3366', icon: 'fa-bullseye', desc: 'Gamified cyber training. Best starting point for beginners.', url: 'https://tryhackme.com' },
        { name: 'HackTheBox', color: '#00cc66', icon: 'fa-cube', desc: 'Real-world machine exploitation. Intermediate to Advanced.', url: 'https://hackthebox.com' },
        { name: 'OverTheWire', color: '#1a1f2c', icon: 'fa-terminal', desc: 'Wargames for Linux CLI & SSH mastery.', url: 'https://overthewire.org' },
        { name: 'OWASP WebGoat', color: '#0066ff', icon: 'fa-shield-cat', desc: 'Deliberately insecure web apps for training.', url: 'https://owasp.org/www-project-webgoat/' }
    ];

    const platformsRight = [
        { name: 'picoCTF', color: '#ef4444', icon: 'fa-flag', desc: 'Free security education with a gamified CTF experience.', url: 'https://www.picoctf.org/' },
        { name: 'CyberDefenders', color: '#3b82f6', icon: 'fa-shield-halved', desc: 'Blue team training focusing on SOC and Forensics.', url: 'https://cyberdefenders.org/' },
        { name: 'RootMe (THM)', color: '#10b981', icon: 'fa-ghost', desc: 'A popular beginner-friendly CTF room on TryHackMe.', url: 'https://tryhackme.com/room/rrootme' },
        { name: 'PortSwigger', color: '#f97316', icon: 'fa-bug', desc: 'Elite web security training from the Burp Suite team.', url: 'https://portswigger.net/web-security' }
    ];

    return (
        <section className="section-wrapper" style={{ paddingTop: 0 }}>
            <h3 style={{ marginBottom: '3rem', fontFamily: 'var(--font-head)', textAlign: 'center', fontSize: '2.5rem' }}>Training <span>Grounds</span></h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {platformsLeft.map(p => (
                        <div key={p.name} className="platform-card hover-trigger" onClick={() => window.open(p.url)} style={{ '--brand-color': p.color }}>
                            <i className={`fa-solid ${p.icon} platform-icon`}></i>
                            <div className="platform-info">
                                <h4>{p.name}</h4>
                                <p style={{ textAlign: 'justify' }}>{p.desc}</p>
                            </div>
                            <i className="fa-solid fa-arrow-up-right-from-square link-arrow"></i>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {platformsRight.map(p => (
                        <div key={p.name} className="platform-card hover-trigger" onClick={() => window.open(p.url)} style={{ '--brand-color': p.color }}>
                            <i className={`fa-solid ${p.icon} platform-icon`}></i>
                            <div className="platform-info">
                                <h4>{p.name}</h4>
                                <p style={{ textAlign: 'justify' }}>{p.desc}</p>
                            </div>
                            <i className="fa-solid fa-arrow-up-right-from-square link-arrow"></i>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrainingSection;
