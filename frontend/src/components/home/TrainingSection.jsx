import React from 'react';

const TrainingSection = () => {
    const platforms = [
        { name: 'TryHackMe', color: '#ff3366', icon: 'fa-bullseye', desc: 'Gamified cyber training. Best starting point for beginners.', url: 'https://tryhackme.com' },
        { name: 'HackTheBox', color: '#00cc66', icon: 'fa-cube', desc: 'Real-world machine exploitation. Intermediate to Advanced.', url: 'https://hackthebox.com' },
        { name: 'OverTheWire', color: '#1a1f2c', icon: 'fa-terminal', desc: 'Wargames for Linux CLI & SSH mastery.', url: 'https://overthewire.org' },
        { name: 'OWASP WebGoat', color: '#0066ff', icon: 'fa-shield-cat', desc: 'Deliberately insecure web apps for training.', url: 'https://owasp.org/www-project-webgoat/' }
    ];

    const certs = [
        { name: 'CompTIA Security+', color: 'var(--accent-success)', level: 'Beginner-Intermediate', time: '4-6 Weeks' },
        { name: 'CEH (Certified Ethical Hacker)', color: 'var(--accent-secondary)', level: 'Intermediate', time: '6-8 Weeks' },
        { name: 'OSCP (Offensive Security)', color: 'var(--accent-alert)', level: 'Advanced (Hands-on)', time: '2-3 Months' },
        { name: 'CISSP (InfoSys Security)', color: 'var(--accent-primary)', level: 'Expert (Management)', time: '3-4 Months' }
    ];

    return (
        <section className="section-wrapper" style={{ paddingTop: 0 }}>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
                <div>
                    <h3 style={{ marginBottom: '2rem', fontFamily: 'var(--font-head)' }}>Training <span>Grounds</span></h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {platforms.map(p => (
                            <div key={p.name} className="platform-card hover-trigger" onClick={() => window.open(p.url)} style={{ '--brand-color': p.color }}>
                                <i className={`fa-solid ${p.icon} platform-icon`}></i>
                                <div className="platform-info">
                                    <h4>{p.name}</h4>
                                    <p>{p.desc}</p>
                                </div>
                                <i className="fa-solid fa-arrow-up-right-from-square link-arrow"></i>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 style={{ marginBottom: '2rem', fontFamily: 'var(--font-head)' }}>Certification <span>Path</span></h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {certs.map(c => (
                            <div key={c.name} className="cert-card hover-trigger" style={{ '--cert-color': c.color }}>
                                <div className="cert-info">
                                    <h4>{c.name}</h4>
                                    <div className="cert-meta">Level: {c.level}</div>
                                </div>
                                <div className="time-badge">{c.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrainingSection;
