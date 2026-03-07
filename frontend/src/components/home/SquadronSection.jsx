import React from 'react';
import './SquadronSection.css';

/* ── Faculty Coordinators ── */
const FACULTY = [
    { name: 'Prof. Manjusha K.', role: 'Lead Mentor', img: '/images/faculty1.jpg', emoji: '🎓', color: '#818cf8' },
    { name: 'Prof. Sneha Dalvi', role: 'Technical Mentor', img: '/images/faculty2.jpg', emoji: '💻', color: '#22d3ee' },
    { name: 'Prof. Randeep Kalhon', role: 'Subject Expert', img: '/images/faculty3.jpg', emoji: '🔬', color: '#34d399' },
    { name: 'Prof. Saylee Lapalikar', role: 'Subject Expert', img: '/images/faculty4.jpg', emoji: '🛡️', color: '#fb923c' },
];

/* ── Club Members ── */
const MEMBERS = [
    { name: "Rudranarayan Pawaskar", role: "Secretary", img: "/images/rudra.jpg" },
    { name: "Shubham Pawaskar", role: "President", img: "/images/shubham.jpg" },
    { name: "Aditya Patil", role: "Technical Head", img: "/images/aditya.jpg" },
    { name: "Harsh Patil", role: "Core Member", img: "/images/harsh.jpg" },
    { name: "Pushkar Gaikwad", role: "Core Member", img: "/images/pushkar.jpg" },
    { name: "Siddharth Kulkarni", role: "Core Member", img: "/images/siddharth.jpg" },
    { name: "Kshitija Mane", role: "Core Member", img: "/images/kshitija.jpg" },
    { name: "Bhumika Chogule", role: "Core Member", img: "/images/bhumika.jpg" },
    { name: "Vaibhavi Naik", role: "Special Member", img: "/images/vaibhavi.jpg" },
    { name: "Nakshi Shinde", role: "Special Member", img: "/images/nakshi.jpg" },
];

const SquadronSection = () => {
    return (
        <section id="members" className="section-wrapper">
            <div className="section-header">
                <h2 className="section-title gradient-text">Our <span>Squadron</span></h2>
                <p className="section-subtitle">Meet the elite team behind APSIT Cybersecurity.</p>
            </div>

            {/* ── FACULTY COORDINATORS ── */}
            <div className="sq-faculty-label">
                <div className="sq-label-line" />
                <span>Faculty Coordinators</span>
                <div className="sq-label-line" />
            </div>

            <div className="sq-faculty-grid">
                {FACULTY.map(f => (
                    <div
                        key={f.name}
                        className="sq-faculty-flip-container hover-trigger"
                        style={{ '--fc': f.color }}
                    >
                        <div className="sq-faculty-flipper">
                            {/* ── FRONT FACE ── */}
                            <div className="sq-faculty-card front">
                                {/* Glassmorphic shine */}
                                <div className="sq-faculty-shine" />

                                {/* Avatar ring — skeuomorphic frame */}
                                <div
                                    className="sq-faculty-ring"
                                    style={{ borderColor: f.color + '66', boxShadow: `0 0 18px ${f.color}33` }}
                                >
                                    <img
                                        src={f.img}
                                        alt={f.name}
                                        className="sq-faculty-img"
                                        loading="lazy"
                                        onError={e => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div
                                        className="sq-faculty-fallback"
                                        style={{ display: 'none', background: f.color + '22', color: f.color }}
                                    >
                                        {f.emoji}
                                    </div>
                                </div>

                                <div className="sq-faculty-info">
                                    <div className="sq-faculty-name">{f.name}</div>
                                    <div className="sq-faculty-role" style={{ color: f.color }}>{f.role}</div>
                                </div>

                                {/* Skeuomorphic corner accent */}
                                <div className="sq-faculty-corner" style={{ borderColor: f.color + '44' }} />
                            </div>

                            {/* ── BACK FACE ── */}
                            <div className="sq-faculty-card back">
                                <div className="sq-faculty-shine" />
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                                    <h4 style={{ color: f.color, marginBottom: '0.75rem', fontFamily: 'var(--font-head)', fontSize: '1.1rem' }}>{f.name}</h4>
                                    <p style={{ fontSize: '0.85rem', color: '#ccc', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                                        Cybersecurity veteran and subject matter expert. Dedicated to mentoring the next generation of operators in threat analysis and tactics.
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.9rem', color: f.color, fontWeight: 'bold' }}>
                                        <span><i className="fa-solid fa-shield-halved" style={{ marginRight: '4px' }}></i> SEC+</span>
                                        <span><i className="fa-solid fa-graduation-cap" style={{ marginRight: '4px' }}></i> PhD</span>
                                    </div>
                                </div>
                                <div className="sq-faculty-corner" style={{ borderColor: f.color + '44' }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── SQUADRON MEMBERS ── */}
            <div className="sq-faculty-label" style={{ marginTop: '3rem' }}>
                <div className="sq-label-line" />
                <span>Club Members</span>
                <div className="sq-label-line" />
            </div>

            <div className="members-grid-v2">
                {MEMBERS.map(m => (
                    <div key={m.name} className="member-card-v2 hover-trigger">
                        <div className="member-status-indicator">ONLINE</div>
                        <div className="member-img-v2">
                            <img src={m.img} alt={m.name} loading="lazy" />
                            <div className="member-overlay-v2">
                                <div className="member-socials-v2">
                                    <a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
                                    <a href="#"><i className="fa-brands fa-github"></i></a>
                                </div>
                            </div>
                        </div>
                        <div className="member-info-v2">
                            <h4>{m.name}</h4>
                            <p>{m.role}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default SquadronSection;
