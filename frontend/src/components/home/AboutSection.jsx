import React from 'react';

const AboutSection = () => {
    return (
        <section id="about" className="section-wrapper">
            <div className="section-header">
                <h2 className="section-title gradient-text">About</h2>
                <p className="section-subtitle">The nexus of student-driven cybersecurity excellence.</p>
            </div>

            <div className="grid">
                <div className="card hover-trigger" style={{ borderTop: '4px solid var(--accent-primary)' }}>
                    <i className="fa-solid fa-shield-halved"
                        style={{ fontSize: '2.5rem', color: 'var(--accent-primary)', marginBottom: '1.5rem' }}></i>
                    <h3 style={{ color: 'var(--accent-primary)' }}>About Us</h3>
                    <p style={{ textAlign: 'justify' }}>
                        A student-driven community at APSIT dedicated to spreading excellence in cybersecurity. We focus
                        on practical learning and innovation to transform students into confident professionals ready
                        for real-world challenges.
                    </p>
                </div>

                <div className="card hover-trigger" style={{ borderTop: '4px solid var(--accent-alert)' }}>
                    <i className="fa-solid fa-crosshairs"
                        style={{ fontSize: '2.5rem', color: 'var(--accent-alert)', marginBottom: '1.5rem' }}></i>
                    <h3 style={{ color: 'var(--accent-alert)' }}>Our Mission</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.8, textAlign: 'justify' }}>
                        Our mission is to build a strong and inclusive student community united by a passion for
                        cybersecurity. We strive to promote ethical hacking awareness, inspire the next generation of
                        cyber defenders, and foster responsible digital citizenship in everything we do.
                    </p>
                </div>

                <div className="card hover-trigger" style={{ borderTop: '4px solid var(--accent-success)' }}>
                    <i className="fa-solid fa-eye"
                        style={{ fontSize: '2.5rem', color: 'var(--accent-success)', marginBottom: '1.5rem' }}></i>
                    <h3 style={{ color: 'var(--accent-success)' }}>Our Vision</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.8, textAlign: 'justify' }}>
                        We envision a learning environment where students receive hands-on training and participate in
                        workshops and competitions that challenge their skills. By encouraging teamwork and leadership,
                        we aim to bridge the gap between academic knowledge and real-world industry demands.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
