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

        // Cleanup function in case component unmounts while modal is open
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedPastEvent]);

    // Only show "CyberDefense" related events in upcoming section
    const upcomingEvents = events.filter(e =>
        e.status === 'upcoming' &&
        (e.title.toLowerCase().includes('ctf') || e.title.toLowerCase().includes('cyberdefense'))
    );

    const pastEvents = [
        {
            id: 'himanshu-event',
            title: 'DEEP DIVE INTO FIREWALL LOG ANALYZER: DETECTING THREATS FROM LOGS',
            shortDesc: 'Expert session on parsing firewall logs to detect intrusions and secure perimeters.',
            fullDesc: 'During this engaging expert talk, Himanshu Rane, Technical Engineer at Softmanage Solution, guided the students through the complexities of analyzing firewall logs. Participants learned practical techniques to detect anomalous patterns, track potential intrusions, and secure network perimeters effectively. The session included live log-parsing demonstrations and real-world case studies detailing how modern enterprises defend against active threats.',
            date: '25th July, 2025',
            report: 'Himanshu Rane Expert Talk (1).docx',
            images: [
                '/images/Himanshu1.jpg',
                '/images/Himanshu2.jpg',
                '/images/himanshu3.jpg',
                '/images/Himanshu4.jpg'
            ]
        }
    ];

    return (
        <section id="events" className="section-wrapper">
            <div className="section-header">
                <h2 className="section-title gradient-text">Club <span>Events</span></h2>
                <p className="section-subtitle">Stay updated on workshops, CTFs, and certification challenges.</p>
            </div>

            <h3 style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: '2rem' }}>
                <i className="fa-solid fa-calendar-days" style={{ marginRight: '8px', color: 'var(--accent-primary)' }}></i>Upcoming
            </h3>
            <div className="grid">
                {/* Pinned featured event card */}
                <div className="card hover-trigger" style={{ textAlign: 'center', borderColor: 'var(--accent-primary)', gridColumn: '1/-1' }}>
                    <span className="tag" style={{ background: 'var(--accent-primary)', color: 'white' }}>Registration Open</span>
                    <h3 style={{ fontSize: '2rem', margin: '1.5rem 0 0.5rem' }}>CyberDefense 2026 CTF</h3>
                    <p style={{ maxWidth: '700px', margin: '0 auto 2rem', color: 'var(--text-muted)' }}>
                        Join 50+ teams in a 48-hour endurance test. Challenges include Web Exploitation, Cryptography, Reverse Engineering, and Forensics.
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate('/register')}>
                        <i className="fa-solid fa-users" style={{ marginRight: '8px' }}></i>Register Team
                    </button>
                </div>
                {loading && <div className="card" style={{ color: 'var(--text-muted)', textAlign: 'center' }}><i className="fa-solid fa-spinner fa-spin"></i> Loading events...</div>}
            </div>

            {/* Past Events Section */}
            <h3 style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: '3rem' }}>
                <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: '8px', color: '#ccc' }}></i>Past Events
            </h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                {pastEvents.map((pe) => (
                    <div key={pe.id} className="card hover-trigger" style={{ opacity: 0.9, display: 'flex', flexDirection: 'column' }}>
                        <span className="tag" style={{ background: '#444' }}>Expert Talk</span>
                        <h3 style={{ fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem' }}>{pe.title}</h3>
                        <p style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', marginBottom: '1rem' }}>{pe.date}</p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flex: 1 }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#222' }}>
                                {/* Main event cover photo */}
                                <img src="/images/Himanshu2.jpg" alt="Himanshu Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} fetchPriority="low" />
                            </div>
                            <p style={{ fontSize: '0.9rem', color: '#ccc', margin: 0 }}>{pe.shortDesc}</p>
                        </div>

                        <button className="btn btn-secondary" style={{ width: '100%', marginTop: 'auto' }} onClick={() => setSelectedPastEvent(pe)}>
                            <i className="fa-solid fa-arrow-right-long" style={{ marginRight: '8px' }}></i>View More
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal for Past Event Details */}
            {selectedPastEvent && createPortal(
                <div className="modal-backdrop" onClick={() => setSelectedPastEvent(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 999999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }}>
                    <div className="modal-content card" onClick={e => e.stopPropagation()} style={{ background: '#1a1a24', maxWidth: '700px', width: '100%', padding: '2.5rem', borderRadius: '16px', position: 'relative', border: '1px solid var(--accent-primary)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button onClick={() => setSelectedPastEvent(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fa-solid fa-times"></i>
                        </button>

                        <span className="tag" style={{ background: '#444', marginBottom: '1rem', display: 'inline-block' }}>{selectedPastEvent.date}</span>
                        <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem', lineHeight: '1.3' }}>{selectedPastEvent.title}</h2>
                        <p style={{ marginBottom: '2rem', lineHeight: '1.8', color: '#ddd' }}>{selectedPastEvent.fullDesc}</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                            {selectedPastEvent.images.map((imgSrc, idx) => (
                                <img key={idx} src={imgSrc} alt={`Event Photo ${idx + 1}`} style={{ width: '100%', height: '300px', borderRadius: '8px', objectFit: 'contain', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }} />
                            ))}
                        </div>

                        <a href={`/images/${selectedPastEvent.report}`} download className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                            <i className="fa-solid fa-download" style={{ marginRight: '10px' }}></i> Download Official Event Report
                        </a>
                    </div>
                </div>,
                document.body
            )}
        </section>
    );
};

export default EventsSection;
