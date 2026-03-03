import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

/* ── main events section ───────────────────────────────────────────── */
const EventsSection = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const EventCard = ({ e, isPast = false }) => (
        <div className="card hover-trigger" style={{ opacity: isPast ? 0.7 : 1 }}>
            <span className="tag">{e.type}</span>
            <h3>{e.title}</h3>
            <p style={{ color: 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p>{e.description}</p>
            {!isPast && (
                <button
                    className="btn btn-secondary"
                    style={{ marginTop: '1rem', width: '100%' }}
                    onClick={() => navigate('/register')}
                >
                    <i className="fa-solid fa-user-plus" style={{ marginRight: '8px' }}></i>Register
                </button>
            )}
        </div>
    );

    // Only show "CyberDefense" related events in upcoming section
    const upcomingEvents = events.filter(e =>
        e.status === 'upcoming' &&
        (e.title.toLowerCase().includes('ctf') || e.title.toLowerCase().includes('cyberdefense'))
    );
    // STRICT: Only the main event is allowed. We hide archives.
    const pastEvents = [];

    return (
        <section id="events" className="section-wrapper">
            <div className="section-header">
                <h2 className="section-title gradient-text">Club <span>Events</span></h2>
                <p className="section-subtitle">Stay updated on workshops, CTFs, and certification challenges.</p>
            </div>

            <h3 style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                <i className="fa-solid fa-calendar-days" style={{ marginRight: '8px', color: 'var(--accent-primary)' }}></i>Upcoming
            </h3>
            <div className="grid">
                {/* Pinned featured event card - The ONLY one that should really be prominent */}
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

                {/* We hide ALL other small cards to maintain 'only ctf main event' visibility */}
            </div>

            {/* Past Archives hidden as per strict request */}
        </section>
    );
};

export default EventsSection;
