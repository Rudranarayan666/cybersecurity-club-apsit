import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const navigate = useNavigate();

    const scrollToSection = (id) => {
        if (window.location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 150);
        } else {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const links = [
        { label: 'Home', id: 'home' },
        { label: 'Mission', id: 'about' },
        { label: 'Training', id: 'learn' },
        { label: 'Events', id: 'events' },
        { label: 'Squadron', id: 'members' },
        { label: 'Contact', id: 'contact' },
    ];

    return (
        <footer style={{
            background: 'rgba(5, 10, 16, 0.95)',
            color: '#94a3b8',
            padding: '4rem 2rem 2rem',
            borderTop: '1px solid rgba(0, 102, 255, 0.1)',
            position: 'relative',
            zIndex: 10
        }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
                    <div>
                        <div className="logo" style={{ marginBottom: '1.5rem', color: '#fff' }}>
                            <i className="fa-solid fa-shield-cat" style={{ color: 'var(--accent-primary)' }}></i>
                            <span>APSIT.<span style={{ color: 'var(--accent-primary)' }}>CYBERSEC</span></span>
                        </div>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.8' }}>
                            The nexus of student-driven cybersecurity excellence.
                            Defending the digital frontier at APSIT.
                        </p>
                    </div>

                    <div>
                        <h4 style={{ color: '#fff', marginBottom: '1.5rem', fontFamily: 'var(--font-head)' }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {links.map(link => (
                                <li key={link.id} style={{ marginBottom: '0.8rem' }}>
                                    <a
                                        onClick={() => scrollToSection(link.id)}
                                        className="hover-trigger"
                                        style={{ color: 'inherit', textDecoration: 'none', transition: '0.3s', cursor: 'pointer' }}
                                    >{link.label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ color: '#fff', marginBottom: '1.5rem', fontFamily: 'var(--font-head)' }}>Terminal Output</h4>
                        <div className="terminal-contact" style={{
                            fontFamily: 'monospace',
                            background: 'rgba(0,0,0,0.3)',
                            padding: '1rem',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            borderLeft: '2px solid var(--accent-primary)'
                        }}>
                            <div style={{ color: 'var(--accent-success)' }}>$ status --check</div>
                            <div style={{ color: '#fff' }}>[ STATUS: ONLINE ]</div>
                            <div style={{ color: 'var(--accent-primary)', marginTop: '0.5rem' }}>$ ping apsit.edu.in</div>
                            <div style={{ color: '#aaa' }}>64 bytes from ... time=12ms</div>
                            <div style={{ color: 'var(--accent-alert)', marginTop: '0.5rem' }}>$ auth --method biometric</div>
                            <div style={{ color: '#fff' }}>Access Granted_</div>
                        </div>
                    </div>
                </div>

                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    paddingTop: '2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    fontSize: '0.8rem'
                }}>
                    <p>© {currentYear} APSIT Cybersecurity Club. All Rights Reserved.</p>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
                        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
