import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

/* ── constants ─────────────────────────────────────────────────────── */
const DEPARTMENTS = [
    'Computer Engineering',
    'CSE AI and ML',
    'CSE Data Science',
    'Information Technology',
];

const YEARS = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];

const EVENT_NAME = 'CyberDefense CTF 2026';

const EMPTY_MEMBER = {
    name: '', email: '', moodle_id: '', roll_no: '',
    division: '', department: '', year: '', mobile: '',
};

const makeMember = (count) =>
    Array.from({ length: count }, (_, i) => ({
        ...EMPTY_MEMBER,
        is_leader: i === 0,
    }));

const DEFAULT_MEMBER_COUNT = 3;

/* ── helpers ───────────────────────────────────────────────────────── */
const Field = ({ label, required, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-label, #cbd5e1)', fontFamily: 'var(--font-head, Space Grotesk, sans-serif)' }}>
            {label}{required && <span style={{ color: '#ff3366', marginLeft: 3 }}>*</span>}
        </label>
        {children}
    </div>
);

const INPUT_STYLE = {
    width: '100%', padding: '0.75rem 1rem',
    background: '#111620', border: '1px solid #334155',
    borderRadius: '8px', color: '#e0e6ed',
    fontSize: '0.95rem', fontFamily: 'DM Sans, sans-serif',
    transition: 'border-color 0.25s, box-shadow 0.25s', outline: 'none',
};

const Input = ({ value, onChange, type = 'text', placeholder, required, pattern, title }) => {
    const [focused, setFocused] = useState(false);
    return (
        <input
            type={type} value={value} onChange={onChange}
            placeholder={placeholder} required={required}
            pattern={pattern} title={title}
            style={{ ...INPUT_STYLE, borderColor: focused ? '#0066ff' : '#334155', boxShadow: focused ? '0 0 0 3px rgba(0,102,255,0.1)' : 'none' }}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        />
    );
};

const Select = ({ value, onChange, required, children }) => {
    const [focused, setFocused] = useState(false);
    return (
        <select
            value={value} onChange={onChange} required={required}
            style={{ ...INPUT_STYLE, borderColor: focused ? '#0066ff' : '#334155', boxShadow: focused ? '0 0 0 3px rgba(0,102,255,0.1)' : 'none', cursor: 'pointer' }}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        >
            {children}
        </select>
    );
};

/* ── member card ───────────────────────────────────────────────────── */
const MemberCard = ({ member, index, onChange }) => {
    const isLeader = index === 0;
    const set = (field) => (e) => onChange(index, field, e.target.value);

    return (
        <div style={{
            background: 'rgba(15,20,35,0.8)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* left accent bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: isLeader ? 'linear-gradient(180deg, #0066ff, #00c2ff)' : '#334155', borderRadius: '12px 0 0 12px' }} />

            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <i className={`fa-solid ${isLeader ? 'fa-crown' : 'fa-user'}`} style={{ color: isLeader ? '#ffd700' : '#0066ff', fontSize: '1.2rem' }}></i>
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.05rem' }}>
                    {isLeader ? '👑 Team Leader Details' : `👤 Team Member ${index + 1} Details`}
                </span>
            </div>

            {/* Row 1: Name + Email */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <Field label="Full Name" required>
                    <Input value={member.name} onChange={set('name')} placeholder="Jane Doe" required />
                </Field>
                <Field label="APSIT Email" required>
                    <Input type="email" value={member.email} onChange={set('email')} placeholder="student@apsit.edu.in" required />
                </Field>
            </div>

            {/* Row 2: Moodle ID + Roll No */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <Field label="Moodle ID" required>
                    <Input value={member.moodle_id} onChange={set('moodle_id')} placeholder="e.g. 22CO001" required pattern="[a-zA-Z0-9]{5,20}" title="5-20 alphanumeric characters" />
                </Field>
                <Field label="Roll Number" required>
                    <Input value={member.roll_no} onChange={set('roll_no')} placeholder="e.g. 22CO046" required />
                </Field>
            </div>

            {/* Row 3: Department + Year */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <Field label="Department" required>
                    <Select value={member.department} onChange={set('department')} required>
                        <option value="">Select Department</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </Select>
                </Field>
                <Field label="Year" required>
                    <Select value={member.year} onChange={set('year')} required>
                        <option value="">Select Year</option>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </Select>
                </Field>
            </div>

            {/* Row 4: Division + Mobile */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                <Field label="Division" required>
                    <Input value={member.division} onChange={set('division')} placeholder="e.g. A, B, C" required />
                </Field>
                <Field label="Mobile No." required>
                    <Input type="tel" value={member.mobile} onChange={set('mobile')} placeholder="10-digit number" required pattern="[0-9]{10}" title="Exactly 10 digits" />
                </Field>
            </div>
        </div>
    );
};

/* ── main component ────────────────────────────────────────────────── */
const Register = () => {
    const navigate = useNavigate();
    const [teamName, setTeamName] = useState('');
    const [memberCount, setMemberCount] = useState(3);
    const [members, setMembers] = useState(() => makeMember(3));
    const [status, setStatus] = useState(null); // null | 'submitting' | 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('');

    const handleCountChange = (e) => {
        const count = parseInt(e.target.value);
        setMemberCount(count);
        setMembers(prev => {
            if (count > prev.length) return [...prev, ...makeMember(count - prev.length)];
            return prev.slice(0, count);
        });
    };

    const handleMemberChange = (index, field, value) => {
        setMembers(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMsg('');

        // Build clean member payload - all fields now required
        const cleanMember = (m, i) => ({
            name: m.name.trim(),
            email: m.email.trim().toLowerCase(),
            moodle_id: m.moodle_id.trim(),
            roll_no: m.roll_no.trim(),
            division: m.division.trim(),
            department: m.department,
            year: m.year,
            mobile: m.mobile.trim(),
            is_leader: i === 0,
        });

        // Perform precise front-end validation
        if (!teamName.trim()) {
            setStatus('error');
            setErrorMsg('Please enter a team name.');
            return;
        }

        for (let i = 0; i < members.length; i++) {
            const m = members[i];
            const memberNum = i + 1;

            if (!m.name.trim() || !m.email.trim() || !m.moodle_id.trim() || !m.roll_no.trim() || !m.department || !m.year || !m.division.trim() || !m.mobile.trim()) {
                setStatus('error');
                setErrorMsg(`Member ${memberNum} is missing required fields (Name, Email, Moodle ID, Roll No, Department, Year, Division, or Mobile).`);
                return;
            }

            // Institutional Email Validation
            const email = m.email.trim().toLowerCase();
            if (!email.endsWith('@apsit.edu.in') && !email.endsWith('@apsit.in')) {
                setStatus('error');
                setErrorMsg(`Member ${memberNum} must use an APSIT institutional email (@apsit.edu.in or @apsit.in).`);
                return;
            }

            // Mobile Validation
            if (!/^[0-9]{10}$/.test(m.mobile.trim())) {
                setStatus('error');
                setErrorMsg(`Member ${memberNum} mobile number must be exactly 10 digits.`);
                return;
            }
        }

        const payload = {
            event_name: EVENT_NAME,
            team_name: teamName.trim(),
            team_members: members.map((m, i) => cleanMember(m, i)),
        };

        const result = await apiService.registerHackathonTeam(payload);
        if (result.success) {
            setStatus('success');
        } else {
            setStatus('error');

            // Extract best possible error message
            let msg = 'Registration failed. Please check your details.';
            if (result.data?.error?.details?.fields) {
                const fields = result.data.error.details.fields;
                // Get the first error message from the fields object
                const fieldKey = Object.keys(fields)[0];
                const fieldError = fields[fieldKey];
                msg = `Validation Error: ${fieldError} (${fieldKey})`;
            } else {
                msg = result.data?.error?.message || result.data?.message || result.error || msg;
            }

            setErrorMsg(msg);
        }
    };

    /* ── success screen ── */
    if (status === 'success') {
        return (
            <div style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'rgba(5,10,16,0.97)', backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
            }}>
                <div style={{
                    textAlign: 'center', maxWidth: 450, width: '100%', padding: '2.5rem',
                    background: 'rgba(20,25,40,0.6)', backdropFilter: 'blur(20px)',
                    border: '1px solid #00cc66', borderRadius: 16,
                    boxShadow: '0 0 60px rgba(0,204,102,0.15)',
                }}>
                    <i className="fa-solid fa-circle-check" style={{ fontSize: '3.5rem', color: '#00cc66', marginBottom: '1rem' }}></i>
                    <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', marginBottom: '1rem', fontSize: '1.8rem' }}>Registration Successful!</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                        Team <strong style={{ color: '#e0e6ed' }}>{teamName}</strong> is registered for <strong style={{ color: '#0066ff' }}>{EVENT_NAME}</strong>.
                    </p>
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.9rem' }}
                        onClick={() => navigate('/')}
                    >
                        <i className="fa-solid fa-house" style={{ marginRight: 8 }}></i>Back to Home
                    </button>
                </div>
            </div>
        );
    }

    /* ── form ── */
    return (
        <div style={{
            minHeight: '100vh', position: 'relative', overflow: 'hidden',
            fontFamily: 'DM Sans, sans-serif',
        }}>
            {/* Animated background grid via pseudo-element is in index.css; fallback orbs: */}
            <div style={{ position: 'fixed', width: 400, height: 400, background: '#0066ff', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.08, top: '10%', left: '5%', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', width: 300, height: 300, background: '#00c2ff', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.08, bottom: '20%', right: '10%', zIndex: 0, pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 10, maxWidth: 820, margin: '0 auto', padding: '2rem 1.5rem', minHeight: '100vh' }}>
                {/* Back button */}
                <button
                    onClick={() => navigate('/')}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)', color: '#e0e6ed',
                        padding: '0.65rem 1.25rem', borderRadius: 8,
                        fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.3s', marginBottom: '2rem',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#0066ff'; e.currentTarget.style.borderColor = '#0066ff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                    <i className="fa-solid fa-arrow-left"></i> Home
                </button>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem', paddingTop: '1rem' }}>
                    <h1 style={{
                        fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', fontWeight: 800,
                        background: 'linear-gradient(135deg, #0066ff, #00c2ff)',
                        WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem', letterSpacing: '-1px',
                    }}>Team Registration</h1>
                    <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Register your team for <strong style={{ color: '#e0e6ed' }}>{EVENT_NAME}</strong></p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Team info card */}
                    <div style={{
                        background: 'rgba(20,25,40,0.6)', backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
                        padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', marginBottom: '1.5rem',
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <Field label="Team Name" required>
                                <Input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. ByteBrigade" required />
                            </Field>
                            <Field label="Number of Members" required>
                                <Select value={memberCount} onChange={handleCountChange} required>
                                    <option value={3}>3 Members</option>
                                    <option value={4}>4 Members</option>
                                </Select>
                            </Field>
                        </div>
                    </div>

                    {/* Member cards */}
                    {members.map((member, i) => (
                        <MemberCard key={i} member={member} index={i} onChange={handleMemberChange} />
                    ))}

                    {/* Error */}
                    {status === 'error' && (
                        <div style={{
                            background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.4)',
                            borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '1.5rem',
                            color: '#ff8099', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                        }}>
                            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '1.2rem', color: '#ff3366' }}></i>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        style={{
                            display: 'block', width: '100%', padding: '1rem',
                            background: 'linear-gradient(135deg, #0066ff, #00c2ff)',
                            color: 'white', border: 'none', borderRadius: 8,
                            fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.1rem', fontWeight: 700,
                            letterSpacing: '0.5px', cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                            opacity: status === 'submitting' ? 0.7 : 1,
                            transition: 'all 0.3s', textTransform: 'uppercase',
                            boxShadow: '0 10px 30px rgba(0,102,255,0.3)',
                        }}
                        onMouseOver={(e) => { if (status !== 'submitting') e.currentTarget.style.transform = 'translateY(-3px)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; }}
                    >
                        {status === 'submitting'
                            ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }}></i>Registering Team...</>
                            : <><i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }}></i>Register Team</>
                        }
                    </button>

                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', marginTop: '1rem' }}>
                        <i className="fa-solid fa-shield-halved" style={{ marginRight: 6 }}></i>
                        All data is encrypted. APSIT email addresses only.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
