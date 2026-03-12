import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

/* ── main events section ───────────────────────────────────────────── */
const EventsSection = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPastEvent, setSelectedPastEvent] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            const result = await apiService.getEvents();
            if (result.success) {
                setEvents(result.data.map(e => ({
                    ...e,
                    status: new Date(e.date) > new Date() ? 'upcoming' : 'past'
                })));
            }
            setLoading(false);
        };
        fetchEvents();
    }, []);

    // Handle body scroll lock when modal is open
    useEffect(() => {
        if (selectedPastEvent) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedPastEvent]);

    const pastEvents = [
        {
            id: 'himanshu-event',
            title: 'DEEP DIVE INTO FIREWALL LOG ANALYZER: DETECTING THREATS FROM LOGS',
            shortDesc: 'Expert session on parsing firewall logs to detect intrusions and secure perimeters.',
            fullDesc: 'During this engaging expert talk, Himanshu Rane, Technical Engineer at Softmanage Solution, guided the students through the complexities of analyzing firewall logs. Participants learned practical techniques to detect anomalous patterns, track potential intrusions, and secure network perimeters effectively.',
            date: '25th July, 2025',
            tag: 'EXPERT TALK',
            report: 'Himanshu Rane Expert Talk (1).docx',
            previewImg: '/images/Himanshu2.jpg',
            images: [
                '/images/Himanshu1.jpg',
                '/images/Himanshu2.jpg',
                '/images/himanshu3.jpg',
                '/images/Himanshu4.jpg'
            ]
        },
        {
            id: 'bootcamp-1',
            title: 'CYBERSECURITY BOOTCAMP: NETWORK PROTOCOLS & COMMANDS',
            shortDesc: 'Practical hands-on session exploring terminal commands, MAC/IP tracing, and network tools.',
            fullDesc: 'The session stood out for its practical approach, where participants explored terminal-based commands to identify their IP and MAC addresses, analyze network configurations, and understand how devices communicate. Students gained exposure to essential tools like ping, traceroute, netstat, and nslookup, alongside explanations of DNS, CIDR, and subnetting.',
            date: '13th August, 2025',
            tag: 'BOOTCAMP',
            report: 'bootcamp session 1.docx',
            previewImg: '/images/bootcamp1image2.jpg',
            images: [
                '/images/Bootcamp1img1.jpg',
                '/images/bootcamp1image2.jpg'
            ]
        },
        {
            id: 'bootcamp-2',
            title: 'CYBERSECURITY BOOTCAMP: NETWORK SCANNING & WEB SECURITY',
            shortDesc: 'Practical demonstrations of Nmap for network scanning and Burp Suite for vulnerability testing.',
            fullDesc: 'The workshop then progressed to the practical demonstration of Nmap (Network Mapper), a widely recognized tool for network discovery and vulnerability assessment. Subsequently, participants were introduced to Burp Suite, a leading tool for web application security testing. Demonstrations included intercepting and analyzing traffic and identifying security flaws such as SQL injection and XSS.',
            date: '17th September, 2025',
            tag: 'BOOTCAMP',
            report: 'Bootcamp 2025 Session 2 (Networking & Security) (1).docx',
            previewImg: '/images/bootcamp2image2.jpg',
            images: [
                '/images/bootcamp2image1.jpg',
                '/images/bootcamp2image2.jpg'
            ]
        },
        {
            id: 'cyber-carnival',
            title: 'CYBER CARNIVAL – WHERE FUN MEETS CYBER POWER',
            shortDesc: 'A unique blend of entertainment and education featuring cyber games and security awareness.',
            fullDesc: 'The Cyber Carnival was a flagship event designed to make cybersecurity engaging and accessible. It featured a variety of interactive booths, including "Hack the Lock" puzzles, social engineering awareness games, and live demonstrations of security concepts. The event successfully combined fun with learning through gamified challenges.',
            date: '18th September, 2025',
            tag: 'FLAGSHIP EVENT',
            report: 'Cyber Carnival – Where Fun Meets Cyber Power.docx',
            previewImg: '/images/cybercarnivalposter.jpg',
            images: [
                '/images/cybercarnival1.jpg',
                '/images/cybercarnivalposter.jpg'
            ]
        }
    ];

    return (
        <section id="events" className="section-wrapper" style={{ padding: '8rem 2rem' }}>
            <div className="section-header" style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <span style={{ color: 'var(--accent-primary)', letterSpacing: '4px', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase' }}>Operations Center</span>
                <h1 className="section-title" style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', marginTop: '0.5rem' }}>Club <span>Events</span></h1>
                <p className="section-subtitle" style={{ maxWidth: '600px', margin: '1rem auto', fontSize: '1rem' }}>Deploying knowledge, securing futures, and building the next generation of cybersecurity elite.</p>
            </div>

            {/* UPCOMING CONTENT */}
            <div style={{ marginBottom: '8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                    <div style={{ height: '2px', width: '30px', background: 'var(--accent-primary)' }}></div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Active <span style={{ color: 'var(--accent-primary)' }}>Missions</span></h2>
                </div>

                <div className="grid">
                    <div className="card" style={{
                        gridColumn: '1 / -1',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '2rem',
                        padding: 'clamp(1.5rem, 5vw, 3rem)',
                        background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.08) 0%, rgba(0, 0, 0, 0.4) 100%)',
                        border: '1px solid rgba(0, 102, 255, 0.3)',
                        boxShadow: '0 0 40px rgba(0, 102, 255, 0.1)'
                    }}>
                        <div style={{ flex: '1 1 450px' }}>
                            <span className="tag" style={{ background: 'var(--accent-primary)', color: '#fff', fontSize: '0.7rem' }}>REGISTRATION OPEN</span>
                            <h3 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', margin: '1rem 0', color: '#fff' }}>CyberDefense 2026 CTF</h3>
                            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: '1.6', textAlign: 'justify' }}>Participate in our annual Capture The Flag competition. A great opportunity to test your security skills and learn from real-world scenarios.</p>
                        </div>
                        <button className="btn btn-primary" style={{ padding: '1.2rem 2.5rem', whiteSpace: 'nowrap' }} onClick={() => navigate('/feedback')}>SUBMIT FEEDBACK</button>
                    </div>
                </div>
            </div>



            {/* PAST DEPLOYMENTS */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                    <div style={{ height: '2px', width: '30px', background: '#4a5568' }}></div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Past <span style={{ color: '#718096' }}>Archive</span></h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))', gap: '2rem' }}>
                    {pastEvents.map((pe) => (
                        <div key={pe.id} className="card hover-trigger" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'rgba(255, 255, 255, 0.01)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            padding: '2.5rem',
                            height: '100%',
                            textAlign: 'center'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <span style={{ color: 'var(--accent-primary)', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '2px' }}>{pe.tag}</span>
                                <span style={{ color: '#4a5568', fontSize: '0.8rem', fontWeight: '600' }}>{pe.date}</span>
                            </div>

                            <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '1rem', lineHeight: '1.3', flex: 0 }}>{pe.title}</h3>

                            <div style={{ display: 'flex', gap: '1.2rem', background: 'rgba(0,0,0,0.3)', padding: '1.2rem', borderRadius: '12px', marginBottom: '2rem', flex: 1, alignItems: 'center' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <img src={pe.previewImg || "/images/Himanshu2.jpg"} alt={pe.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#718096', margin: 0, lineHeight: '1.6', textAlign: 'justify' }}>{pe.shortDesc}</p>
                            </div>

                            <button onClick={() => setSelectedPastEvent(pe)} className="btn btn-secondary" style={{ width: '100%', border: '1px solid #2d3748', background: 'transparent' }}>
                                ANALYSIS LOGS <i className="fa-solid fa-arrow-right" style={{ marginLeft: '10px' }}></i>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* PORTAL MODAL */}
            {selectedPastEvent && createPortal(
                <div className="modal-backdrop" onClick={() => setSelectedPastEvent(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(2, 6, 12, 0.98)', zIndex: 999999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', backdropFilter: 'blur(10px)' }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                        background: '#0a0f18',
                        maxWidth: '800px',
                        width: '100%',
                        padding: '3.5rem',
                        borderRadius: '24px',
                        position: 'relative',
                        border: '1px solid rgba(0, 102, 255, 0.2)',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <button onClick={() => setSelectedPastEvent(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                            <span style={{ color: 'var(--accent-primary)', fontWeight: '800', fontSize: '0.75rem', letterSpacing: '2px' }}>{selectedPastEvent.tag}</span>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#2d3748' }}></div>
                            <span style={{ color: '#4a5568', fontSize: '0.9rem' }}>DEPLOYED: {selectedPastEvent.date}</span>
                        </div>

                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', marginBottom: '2rem', lineHeight: '1.2' }}>{selectedPastEvent.title}</h2>

                        <div style={{ padding: '2rem', background: 'rgba(0,0,0,0.5)', borderRadius: '16px', borderLeft: '4px solid var(--accent-primary)', marginBottom: '3rem' }}>
                            <p style={{ margin: 0, lineHeight: '1.8', color: '#a0aec0', fontSize: '1.1rem', textAlign: 'justify' }}>{selectedPastEvent.fullDesc}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                            {selectedPastEvent.images.map((imgSrc, idx) => (
                                <div key={idx} style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: '#000' }}>
                                    <img src={imgSrc} alt={`Log Image ${idx + 1}`} style={{ width: '100%', height: '280px', objectFit: 'contain' }} />
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <a href={`/images/${selectedPastEvent.report}`} download className="btn btn-primary" style={{ flex: 1, padding: '1.2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                                <i className="fa-solid fa-file-invoice"></i> DOWNLOAD SESSION REPORT
                            </a>
                            <button onClick={() => setSelectedPastEvent(null)} className="btn btn-secondary" style={{ padding: '0 2rem', borderRadius: '12px', border: '1px solid #2d3748' }}>DISMISS</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </section>
    );
};

export default EventsSection;

