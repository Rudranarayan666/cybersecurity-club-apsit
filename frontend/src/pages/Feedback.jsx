import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

/* ── tiny design tokens ───────────────────────────────────────── */
const C = {
    base: '#030712',
    glass: 'rgba(17, 24, 39, 0.6)',
    glassBright: 'rgba(31, 41, 55, 0.8)',
    border: 'rgba(0, 255, 204, 0.15)',
    borderHover: 'rgba(0, 255, 204, 0.5)',
    accentPrimary: '#00ffcc', // Cyberpunk Bright Cyan/Green
    accentSecondary: '#7000ff', // Deep Neon Purple
    accentTertiary: '#ff007f', // Neon Pink
    accentSuccess: '#10b981',
    accentError: '#ef4444',
    text: '#f9fafb',
    muted: '#9ca3af',
};

// Inject Global Styles for advanced animations & pseudo-classes
const injectStyles = () => {
    if (!document.getElementById('feedback-dynamic-styles')) {
        const style = document.createElement('style');
        style.id = 'feedback-dynamic-styles';
        style.innerHTML = `
            @keyframes floatUp {
                0% { transform: translateY(30px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
            .neon-input {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                background: rgba(17, 24, 39, 0.8);
            }
            .neon-input:focus {
                border-color: ${C.accentPrimary};
                box-shadow: 0 0 25px rgba(0, 255, 204, 0.15), inset 0 0 10px rgba(0, 255, 204, 0.05);
                background: rgba(3, 7, 18, 0.9);
                transform: translateY(-2px);
                outline: none;
            }
            .radio-card {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .radio-card:hover {
                transform: translateY(-3px);
                border-color: ${C.borderHover};
                background: rgba(0, 255, 204, 0.08);
                box-shadow: 0 5px 15px rgba(0, 255, 204, 0.1);
            }
            .glass-section {
                animation: floatUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                opacity: 0;
            }
            .submit-btn {
                background: linear-gradient(135deg, ${C.accentSecondary}, ${C.accentPrimary}, ${C.accentTertiary});
                background-size: 200% auto;
                transition: 0.5s;
            }
            .submit-btn:hover:not(:disabled) {
                background-position: right center;
                box-shadow: 0 0 40px rgba(0, 255, 204, 0.5);
                transform: translateY(-3px) scale(1.02);
            }
            .star-wrapper {
                transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .star-wrapper:hover {
                transform: scale(1.3) translateY(-5px);
            }
        `;
        document.head.appendChild(style);
    }
};

/* ── inline styled form components ────────────────────────────── */
const FormGroup = ({ label, required, children, helperText, icon }) => (
    <div style={{ marginBottom: '1.75rem', position: 'relative' }}>
        <label style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.95rem', fontWeight: 600, color: '#e5e7eb',
            marginBottom: '0.75rem', letterSpacing: '0.5px'
        }}>
            {icon && <i className={icon} style={{ color: C.accentPrimary }}></i>}
            {label} {required && <span style={{ color: C.accentTertiary, textShadow: `0 0 8px ${C.accentTertiary}` }}>*</span>}
        </label>
        {children}
        {helperText && <div style={{ fontSize: '0.8rem', color: C.muted, marginTop: '0.5rem', fontStyle: 'italic' }}>{helperText}</div>}
    </div>
);

const Input = (props) => (
    <input
        className="neon-input"
        style={{
            width: '100%', padding: '1rem 1.25rem',
            border: `1px solid ${C.border}`,
            borderRadius: '12px', color: C.text, fontSize: '1rem',
            fontFamily: 'inherit', boxSizing: 'border-box'
        }}
        {...props}
    />
);

const Textarea = (props) => (
    <textarea
        className="neon-input"
        style={{
            width: '100%', padding: '1.25rem', minHeight: '140px', resize: 'vertical',
            border: `1px solid ${C.border}`,
            borderRadius: '16px', color: C.text, fontSize: '1rem', boxSizing: 'border-box',
            fontFamily: 'inherit',
        }}
        {...props}
    />
);

const RadioGroup = ({ name, options, value, onChange, vertical = false }) => (
    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: vertical ? '1fr' : 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        {options.map((opt) => (
            <label key={opt} className="radio-card" style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
                color: value === opt ? '#fff' : C.muted,
                padding: '1rem',
                background: value === opt ? 'rgba(0, 255, 204, 0.15)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${value === opt ? C.accentPrimary : 'rgba(255,255,255,0.05)'}`,
                borderRadius: '12px',
                boxShadow: value === opt ? `0 0 20px rgba(0, 255, 204, 0.2)` : 'none'
            }}>
                <div style={{
                    width: '20px', height: '20px', borderRadius: '50%',
                    border: `2px solid ${value === opt ? C.accentPrimary : C.muted}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                }}>
                    {value === opt && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: C.accentPrimary, boxShadow: `0 0 10px ${C.accentPrimary}` }} />}
                </div>
                <input
                    type="radio"
                    name={name}
                    value={opt}
                    checked={value === opt}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                />
                <span style={{ flex: 1 }}>{opt}</span>
            </label>
        ))}
    </div>
);

const StarRating = ({ value, onChange, labelLeft, labelRight }) => {
    const [hovered, setHovered] = useState(0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: C.accentPrimary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                <span>{labelLeft}</span>
                <span>{labelRight}</span>
            </div>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.8) 0%, rgba(3, 7, 18, 0.9) 100%)',
                padding: '1.5rem', borderRadius: '16px', border: `1px solid ${C.border}`,
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
            }}>
                {[1, 2, 3, 4, 5].map((num) => {
                    const isActive = (hovered || value) >= num;
                    const isSelected = value === num;

                    return (
                        <div key={num}
                            className="star-wrapper"
                            onMouseEnter={() => setHovered(num)}
                            onMouseLeave={() => setHovered(0)}
                            onClick={() => onChange(num)}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                cursor: 'pointer',
                                filter: isSelected ? 'drop-shadow(0 0 10px rgba(0, 255, 204, 0.8))' : 'none'
                            }}>
                            <i className={`fa-star star-icon ${isActive ? 'fa-solid' : 'fa-regular'}`}
                                style={{
                                    color: isActive ? C.accentPrimary : 'rgba(156, 163, 175, 0.3)',
                                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                                    textShadow: isActive ? `0 0 15px ${C.accentPrimary}` : 'none'
                                }}></i>
                            <span style={{
                                fontSize: '0.85rem', fontWeight: isActive ? 800 : 500,
                                color: isActive ? '#fff' : C.muted,
                                transition: 'color 0.2s'
                            }}>{num}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


/* ── main component ────────────────────────────────────────────────── */
const Feedback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        injectStyles();
    }, []);

    // Form state matching exactly the requested schema
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        year: '',
        department: '',
        moodle_id: '',
        overall_rating: 0,
        practical_concepts_rating: 0,
        interesting_rating: '',
        difficulty_rating: '',
        enjoyed_category: '',
        improved_skills: '',
        encouraged_teamwork: '',
        valuable_learning: '',
        challenges_faced: '',
        suggestions: '',
        liked_challenges: ''
    });

    const [status, setStatus] = useState(null); // null | 'submitting' | 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation for missing required fields (ratings & radios)
        if (!formData.overall_rating || !formData.practical_concepts_rating) {
            setErrorMsg("Please provide star ratings for the first two questions.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        if (!formData.interesting_rating || !formData.difficulty_rating || !formData.enjoyed_category || !formData.improved_skills || !formData.encouraged_teamwork) {
            setErrorMsg("Please make sure all multiple-choice options are selected.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setStatus('submitting');
        setErrorMsg('');

        try {
            const result = await apiService.submitFeedback(formData);
            if (result.success) {
                setStatus('success');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setStatus('error');
                setErrorMsg(result.error || 'Failed to submit feedback. Please check your inputs.');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            setStatus('error');
            setErrorMsg('A network error occurred. Please try again.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Success View
    if (status === 'success') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 1.5rem 4rem', background: C.base, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60vw', height: '60vw', background: `radial-gradient(circle, ${C.accentPrimary}20 0%, transparent 70%)`, filter: 'blur(60px)', zIndex: 0 }}></div>
                <div className="glass-section" style={{
                    background: C.glassBright, backdropFilter: 'blur(20px)',
                    border: `1px solid ${C.accentSuccess}`, borderRadius: '30px',
                    padding: '4rem 3rem', textAlign: 'center', maxWidth: '500px', width: '100%',
                    boxShadow: `0 30px 60px rgba(16, 185, 129, 0.15), inset 0 0 20px rgba(16, 185, 129, 0.1)`,
                    position: 'relative', zIndex: 1
                }}>
                    <div style={{
                        width: '90px', height: '90px', borderRadius: '50%', background: `linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))`,
                        border: `2px solid ${C.accentSuccess}`, color: C.accentSuccess, fontSize: '3rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem',
                        boxShadow: `0 0 40px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(16, 185, 129, 0.2)`
                    }}>
                        <i className="fa-solid fa-check"></i>
                    </div>
                    <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2.5rem', color: '#fff', marginBottom: '1rem', fontWeight: 800 }}>Operation Successful</h2>
                    <p style={{ color: C.muted, fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                        Intel received. Thank you for your valuable feedback! Your data has been securely transmitted and logged.
                    </p>
                    <button onClick={() => navigate('/')} style={{
                        width: '100%', padding: '1.25rem', background: `linear-gradient(135deg, ${C.accentPrimary}, ${C.accentSecondary})`,
                        color: '#000', border: 'none', borderRadius: '14px', fontSize: '1.1rem', fontWeight: 800,
                        cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: `0 10px 25px rgba(0, 255, 204, 0.3)`
                    }}>
                        Return to Base <i className="fa-solid fa-house" style={{ marginLeft: '10px' }}></i>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '120px 1rem 5rem', background: C.base, color: C.text, position: 'relative', overflowX: 'hidden' }}>

            {/* Dynamic Abstract Background Elements */}
            <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: `radial-gradient(circle, ${C.accentSecondary}30 0%, transparent 70%)`, filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }}></div>
            <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: `radial-gradient(circle, ${C.accentPrimary}20 0%, transparent 70%)`, filter: 'blur(120px)', zIndex: 0, pointerEvents: 'none' }}></div>
            <div style={{ position: 'fixed', top: '40%', right: '10%', width: '30vw', height: '30vw', background: `radial-gradient(circle, ${C.accentTertiary}15 0%, transparent 70%)`, filter: 'blur(90px)', zIndex: 0, pointerEvents: 'none' }}></div>

            <div style={{ maxWidth: '850px', margin: '0 auto', position: 'relative', zIndex: 10 }}>

                {/* Aesthetic Header */}
                <div className="glass-section" style={{ textAlign: 'center', marginBottom: '4rem', animationDelay: '0s' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.6rem 1.5rem', background: 'rgba(0, 255, 204, 0.1)', border: `1px solid ${C.accentPrimary}50`, borderRadius: '30px', color: C.accentPrimary, fontWeight: 800, fontSize: '0.85rem', marginBottom: '1.5rem', letterSpacing: '2px', textTransform: 'uppercase', boxShadow: `0 0 20px ${C.accentPrimary}20` }}>
                        <i className="fa-solid fa-fingerprint"></i> Activity Intel Collection
                    </div>
                    <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, margin: '0 0 1.25rem', lineHeight: 1.1, background: `linear-gradient(to right, #fff, ${C.accentPrimary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        CTF Experience <br /> Feedback
                    </h1>
                    <p style={{ color: C.muted, fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                        Decrypt your thoughts and transmit them to HQ. Your insights shape our future cybersecurity challenges and bootcamps.
                    </p>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="glass-section" style={{ background: `linear-gradient(90deg, ${C.accentError}20, transparent)`, borderLeft: `4px solid ${C.accentError}`, borderRadius: '12px', padding: '1.25rem 1.5rem', color: '#fff', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600, boxShadow: `0 10px 30px rgba(0,0,0,0.5)` }}>
                        <i className="fa-solid fa-circle-exclamation" style={{ color: C.accentError, fontSize: '1.5rem' }}></i> {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* Section 1: Personal Details */}
                    <div className="glass-section" style={{
                        background: C.glass, backdropFilter: 'blur(20px)', border: `1px solid rgba(255,255,255,0.05)`, borderTop: `1px solid rgba(255,255,255,0.1)`, borderRadius: '24px',
                        padding: 'clamp(1.5rem, 5vw, 3rem)', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', marginBottom: '2.5rem', animationDelay: '0.1s'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: `linear-gradient(135deg, ${C.accentSecondary}, ${C.accentPrimary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff', boxShadow: `0 0 20px ${C.accentPrimary}40` }}>01</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#fff', letterSpacing: '0.5px' }}>Operator Identity</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
                            <FormGroup label="Email Address" icon="fa-solid fa-envelope" required>
                                <Input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="student@apsit.edu.in" required />
                            </FormGroup>
                            <FormGroup label="Full Name" icon="fa-solid fa-user" required>
                                <Input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="John Doe" required />
                            </FormGroup>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.5rem', marginTop: '0.5rem' }}>
                            <FormGroup label="Year of Study" icon="fa-solid fa-graduation-cap" required>
                                <Input type="text" value={formData.year} onChange={e => handleChange('year', e.target.value)} placeholder="e.g. Third Year" required />
                            </FormGroup>
                            <FormGroup label="Department" icon="fa-solid fa-building-columns" required>
                                <Input type="text" value={formData.department} onChange={e => handleChange('department', e.target.value)} placeholder="e.g. Computer Engineering" required />
                            </FormGroup>
                            <FormGroup label="Moodle ID" icon="fa-solid fa-id-card" required>
                                <Input type="text" value={formData.moodle_id} onChange={e => handleChange('moodle_id', e.target.value)} placeholder="e.g. 21102030" required />
                            </FormGroup>
                        </div>
                    </div>

                    {/* Section 2: Ratings */}
                    <div className="glass-section" style={{
                        background: C.glass, backdropFilter: 'blur(20px)', border: `1px solid rgba(255,255,255,0.05)`, borderTop: `1px solid rgba(255,255,255,0.1)`, borderRadius: '24px',
                        padding: 'clamp(1.5rem, 5vw, 3rem)', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', marginBottom: '2.5rem', animationDelay: '0.2s'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: `linear-gradient(135deg, ${C.accentSecondary}, ${C.accentPrimary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff', boxShadow: `0 0 20px ${C.accentPrimary}40` }}>02</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#fff', letterSpacing: '0.5px' }}>Mission Evaluation</h3>
                        </div>

                        <FormGroup label="How would you rate your overall experience in the CTF activity?" required>
                            <StarRating value={formData.overall_rating} onChange={v => handleChange('overall_rating', v)} labelLeft="Poor" labelRight="Outstanding" />
                        </FormGroup>

                        <div style={{ marginTop: '3rem' }}></div>

                        <FormGroup label="The CTF activity helped me understand practical cybersecurity concepts." required>
                            <StarRating value={formData.practical_concepts_rating} onChange={v => handleChange('practical_concepts_rating', v)} labelLeft="Strongly Disagree" labelRight="Strongly Agree" />
                        </FormGroup>
                    </div>

                    {/* Section 3: Multiple Choice Analytics */}
                    <div className="glass-section" style={{
                        background: C.glass, backdropFilter: 'blur(20px)', border: `1px solid rgba(255,255,255,0.05)`, borderTop: `1px solid rgba(255,255,255,0.1)`, borderRadius: '24px',
                        padding: 'clamp(1.5rem, 5vw, 3rem)', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', marginBottom: '2.5rem', animationDelay: '0.3s'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: `linear-gradient(135deg, ${C.accentSecondary}, ${C.accentPrimary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff', boxShadow: `0 0 20px ${C.accentPrimary}40` }}>03</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#fff', letterSpacing: '0.5px' }}>Telemetry & Analytics</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            <FormGroup label="How interesting were the CTF challenges?" icon="fa-solid fa-gamepad" required>
                                <RadioGroup name="interesting" value={formData.interesting_rating} onChange={v => handleChange('interesting_rating', v)}
                                    options={['Very Interesting', 'Interesting', 'Neutral', 'Not Interesting']} />
                            </FormGroup>

                            <FormGroup label="How would you rate the difficulty level of the challenges?" icon="fa-solid fa-shield-halved" required>
                                <RadioGroup name="difficulty" value={formData.difficulty_rating} onChange={v => handleChange('difficulty_rating', v)}
                                    options={['Very Easy', 'Easy', 'Moderate', 'Difficult', 'Very Difficult']} />
                            </FormGroup>

                            <FormGroup label="Which type of challenge did you enjoy the most?" icon="fa-solid fa-crosshairs" required>
                                <RadioGroup name="category" value={formData.enjoyed_category} onChange={v => handleChange('enjoyed_category', v)}
                                    options={['Cryptography', 'Web Security', 'Forensics', 'Reverse Engineering', 'Miscellaneous']} />
                            </FormGroup>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem', background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '16px', border: `1px solid ${C.border}` }}>
                                <FormGroup label="Improved problem-solving?" icon="fa-solid fa-brain" required>
                                    <RadioGroup name="skills" value={formData.improved_skills} onChange={v => handleChange('improved_skills', v)} vertical
                                        options={['Yes', 'Somewhat', 'No']} />
                                </FormGroup>

                                <FormGroup label="Encouraged collaboration?" icon="fa-solid fa-users" required>
                                    <RadioGroup name="teamwork" value={formData.encouraged_teamwork} onChange={v => handleChange('encouraged_teamwork', v)} vertical
                                        options={['Yes', 'Somewhat', 'No']} />
                                </FormGroup>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Open Ended */}
                    <div className="glass-section" style={{
                        background: C.glass, backdropFilter: 'blur(20px)', border: `1px solid rgba(255,255,255,0.05)`, borderTop: `1px solid rgba(255,255,255,0.1)`, borderRadius: '24px',
                        padding: 'clamp(1.5rem, 5vw, 3rem)', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', marginBottom: '3rem', animationDelay: '0.4s'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: `linear-gradient(135deg, ${C.accentSecondary}, ${C.accentPrimary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff', boxShadow: `0 0 20px ${C.accentPrimary}40` }}>04</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#fff', letterSpacing: '0.5px' }}>Declassified Intel</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <FormGroup label="What was the most valuable thing you learned during the CTF activity?" icon="fa-solid fa-lightbulb" required>
                                <Textarea value={formData.valuable_learning} onChange={e => handleChange('valuable_learning', e.target.value)} placeholder="Share your top takeaway..." required />
                            </FormGroup>

                            <FormGroup label="What challenges or difficulties did you face during the activity?" icon="fa-solid fa-triangle-exclamation" required>
                                <Textarea value={formData.challenges_faced} onChange={e => handleChange('challenges_faced', e.target.value)} placeholder="Describe any roadblocks..." required />
                            </FormGroup>

                            <FormGroup label="Any suggestions to improve future CTF activities?" icon="fa-solid fa-fire" required>
                                <Textarea value={formData.suggestions} onChange={e => handleChange('suggestions', e.target.value)} placeholder="Help us make the next event even better..." required />
                            </FormGroup>

                            <FormGroup label="Which specific challenges did you like the most? (Optional)" icon="fa-solid fa-star">
                                <Input type="text" value={formData.liked_challenges} onChange={e => handleChange('liked_challenges', e.target.value)} placeholder="e.g. The SQL Injection login bypass or the Caesar Cipher" />
                            </FormGroup>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="glass-section" style={{ marginTop: '2rem', animationDelay: '0.5s' }}>
                        <button type="submit" className="submit-btn" disabled={status === 'submitting'} style={{
                            width: '100%', padding: '1.5rem',
                            color: '#000', border: 'none', borderRadius: '20px', fontSize: '1.2rem', fontWeight: 800,
                            cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                            opacity: status === 'submitting' ? 0.7 : 1,
                            textTransform: 'uppercase', letterSpacing: '2px'
                        }}>
                            {status === 'submitting' ? (
                                <><i className="fa-solid fa-spinner fa-spin"></i> Transmitting Intel...</>
                            ) : (
                                <>Submit Mission Feedback <i className="fa-solid fa-satellite-dish"></i></>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Feedback;
