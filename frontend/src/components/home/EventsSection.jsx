import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

/* ── tiny registration modal ──────────────────────────────────────── */
const RegistrationModal = ({ event, onClose }) => {
    const [name, setName] = useState('');
    const [moodleId, setMoodleId] = useState('');
    const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        const result = await apiService.registerForEvent(event.id, name, moodleId);
        if (result.success) {
            setStatus('success');
        } else {
            setStatus('error');
            setErrorMsg(result.error || 'Registration failed. Try again.');
        }
    };

    return (
        <div
            onClick={(e) => e.target === e.currentTarget && onClose()}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem'
            }}
        >
            <div style={{
                background: 'var(--bg-base)', border: '1px solid var(--accent-primary)',
                borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '440px',
                boxShadow: '0 0 40px rgba(0,102,255,0.2)', position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer' }}
                >✕</button>

                <div style={{ marginBottom: '1.5rem' }}>
                    <span className="tag">Event Registration</span>
                    <h3 style={{ marginTop: '0.5rem' }}>{event.title}</h3>
                    <p style={{ color: 'var(--accent-primary)', fontSize: '0.85rem' }}>{event.date}</p>
                </div>

                {status === 'success' ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <i className="fa-solid fa-circle-check" style={{ fontSize: '3rem', color: 'var(--accent-success)', marginBottom: '1rem' }}></i>
                        <h4 style={{ color: 'var(--accent-success)' }}>Registration Complete!</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You're registered for <strong>{event.title}</strong>.</p>
                        <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '1.5rem' }}>Close</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div className="cyber-input-group">
                            <input
                                type="text" className="cyber-input" required
                                value={name} onChange={e => setName(e.target.value)}
                            />
                            <label className="cyber-label">Full Name (Operative Name)</label>
                            <span className="input-bar"></span>
                        </div>
                        <div className="cyber-input-group">
                            <input
                                type="text" className="cyber-input" required
                                pattern="[a-zA-Z0-9]{5,20}" title="5-20 alphanumeric characters"
                                value={moodleId} onChange={e => setMoodleId(e.target.value)}
                            />
                            <label className="cyber-label">Moodle ID (5-20 alphanumeric)</label>
                            <span className="input-bar"></span>
                        </div>

                        {status === 'error' && (
                            <p style={{ color: 'var(--accent-alert)', fontSize: '0.85rem', margin: 0 }}>
                                <i className="fa-solid fa-triangle-exclamation"></i> {errorMsg}
                            </p>
                        )}

                        <button
                            type="submit" className="btn btn-primary"
                            disabled={status === 'loading'}
                            style={{ marginTop: '0.5rem' }}
                        >
                            {status === 'loading'
                                ? <><i className="fa-solid fa-spinner fa-spin"></i> Registering...</>
                                : <><i className="fa-solid fa-shield-check" style={{ marginRight: '8px' }}></i>Confirm Registration</>
                            }
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

/* ── main events section ───────────────────────────────────────────── */
const EventsSection = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);

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
                    onClick={() => setSelectedEvent(e)}
                >
                    <i className="fa-solid fa-user-plus" style={{ marginRight: '8px' }}></i>Register
                </button>
            )}
        </div>
    );

    const upcomingEvents = events.filter(e => e.status === 'upcoming');
    const pastEvents = events.filter(e => e.status === 'past');

    return (
        <section id="events" className="section-wrapper">
            {selectedEvent && (
                <RegistrationModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
            )}

            <div className="section-header">
                <h2 className="section-title gradient-text">Club <span>Events</span></h2>
                <p className="section-subtitle">Stay updated on workshops, CTFs, and certification challenges.</p>
            </div>

            <h3 style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
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
                    <button className="btn btn-primary" onClick={() => {/* hackathon modal can go here */window.scrollTo({ top: 0 }) }}>
                        <i className="fa-solid fa-users" style={{ marginRight: '8px' }}></i>Register Team
                    </button>
                </div>
                {loading && <div className="card" style={{ color: 'var(--text-muted)', textAlign: 'center' }}><i className="fa-solid fa-spinner fa-spin"></i> Loading events...</div>}
                {!loading && upcomingEvents.length === 0 && <div className="card" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No upcoming events scheduled yet. Check back soon.</div>}
                {upcomingEvents.map(e => <EventCard key={e.id} e={e} />)}
            </div>

            {pastEvents.length > 0 && (
                <>
                    <h3 style={{ color: 'var(--text-muted)', margin: '4rem 0 1.5rem' }}>
                        <i className="fa-solid fa-box-archive" style={{ marginRight: '8px' }}></i>Past Archives
                    </h3>
                    <div className="grid">
                        {pastEvents.map(e => <EventCard key={e.id} e={e} isPast />)}
                    </div>
                </>
            )}
        </section>
    );
};

export default EventsSection;
