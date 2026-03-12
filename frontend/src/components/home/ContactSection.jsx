import React, { useState } from 'react';

const ContactSection = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState(null); // null | 'sending' | 'success' | 'error'

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        // Simulate a brief delay (no /api/contact endpoint yet)
        await new Promise(r => setTimeout(r, 800));
        setStatus('success');
    };

    const mailtoLink = `mailto:cybersecurityclub@apsit.edu.in?subject=Message from ${encodeURIComponent(formData.name)}&body=${encodeURIComponent(formData.message)}%0A%0AReply to: ${encodeURIComponent(formData.email)}`;

    return (
        <section id="contact" className="section-wrapper">
            <div className="section-header">
                <h2 className="section-title gradient-text">Get <span>In Touch</span></h2>
                <p className="section-subtitle">Secure communications channel for inquiries and collaborations.</p>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 1.2fr' }}>
                {/* Info column */}
                <div className="card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,102,255,0.1)' }}>
                    <h3 style={{ marginBottom: '2rem' }}>Contact Info</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {[
                            { icon: 'fa-location-dot', color: 'var(--accent-primary)', label: 'Location', value: 'APSIT, Thane, Maharashtra' },
                            { icon: 'fa-envelope', color: 'var(--accent-alert)', label: 'Email', value: 'cybersecurityclub@apsit.edu.in' },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', background: `${item.color}18`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <i className={`fa-solid ${item.icon}`} style={{ color: item.color }}></i>
                                </div>
                                <div>
                                    <h5 style={{ margin: 0, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>{item.label}</h5>
                                    <p style={{ margin: 0, fontWeight: '600' }}>{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '3rem' }}>
                        <h5 style={{ marginBottom: '1.2rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Follow the Signal</h5>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {[
                                { href: 'https://instagram.com/cybersecurityclub_apsit', icon: 'fa-instagram', color: '#e1306c' },
                                { href: 'https://linkedin.com/company/cybersecurity-club-apsit/', icon: 'fa-linkedin-in', color: '#0077b5' },
                                { href: 'https://chat.whatsapp.com/JIAYxYq1PXz7KduUqLkUJM', icon: 'fa-whatsapp', color: '#25d366' },
                            ].map(s => (
                                <a key={s.icon} href={s.href} target="_blank" rel="noreferrer"
                                    style={{ width: '45px', height: '45px', borderRadius: '50%', background: `${s.color}20`, border: `1px solid ${s.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, textDecoration: 'none', transition: '0.3s' }}
                                    onMouseOver={e => e.currentTarget.style.background = `${s.color}40`}
                                    onMouseOut={e => e.currentTarget.style.background = `${s.color}20`}
                                >
                                    <i className={`fa-brands ${s.icon}`}></i>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form column */}
                <div className="card">
                    {status === 'success' ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <i className="fa-solid fa-satellite-dish" style={{ fontSize: '3rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}></i>
                            <h3 style={{ color: 'var(--accent-success)' }}>Transmission Ready</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                Click below to send your message directly via email.
                            </p>
                            <a href={mailtoLink} className="btn btn-primary" style={{ display: 'inline-block', marginBottom: '1rem' }}>
                                <i className="fa-solid fa-paper-plane" style={{ marginRight: '8px' }}></i>Open in Email Client
                            </a>
                            <br />
                            <button
                                className="btn btn-secondary"
                                style={{ marginTop: '0.5rem' }}
                                onClick={() => { setStatus(null); setFormData({ name: '', email: '', message: '' }); }}
                            >Send Another</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            {[
                                { name: 'name', label: 'Identify Yourself (Full Name)', type: 'text' },
                                { name: 'email', label: 'Communication Node (Email)', type: 'email' },
                            ].map(field => (
                                <div key={field.name} className="cyber-input-group">
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        className="cyber-input"
                                        required
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                    />
                                    <label className="cyber-label">{field.label}</label>
                                    <span className="input-bar"></span>
                                </div>
                            ))}
                            <div className="cyber-input-group">
                                <textarea
                                    name="message"
                                    className="cyber-input"
                                    rows="4"
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                ></textarea>
                                <label className="cyber-label">Transmission Brief (Message)</label>
                                <span className="input-bar"></span>
                            </div>

                            <button
                                className="btn btn-primary"
                                type="submit"
                                disabled={status === 'sending'}
                                style={{ marginTop: '1rem' }}
                            >
                                {status === 'sending' ? (
                                    <><i className="fa-solid fa-spinner fa-spin"></i> Encrypting...</>
                                ) : (
                                    <><i className="fa-solid fa-paper-plane" style={{ marginRight: '8px' }}></i>Send Transmission</>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
