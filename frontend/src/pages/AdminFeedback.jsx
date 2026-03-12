import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

/* ── tiny design tokens ───────────────────────────────────────── */
const C = {
    base: '#050a10',
    glass: 'rgba(20,30,50,0.7)',
    border: 'rgba(0,102,255,0.18)',
    accent: '#0066ff',
    accentCyan: '#00c2ff',
    accentGreen: '#00cc66',
    accentYellow: '#f59e0b',
    text: '#e0e6ed',
    muted: '#94a3b8',
};

const Badge = ({ children, color = C.accent }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem',
        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
        background: `${color}22`, color, border: `1px solid ${color}44`,
    }}>{children}</span>
);

const StatCard = ({ icon, value, label, color = C.accent }) => (
    <div style={{
        background: C.glass, border: `1px solid ${C.border}`,
        borderRadius: '16px', padding: '1.5rem', display: 'flex',
        alignItems: 'center', gap: '1.25rem', backdropFilter: 'blur(14px)',
        flex: 1, minWidth: '160px', transition: 'all 0.3s ease',
    }}>
        <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: `${color}18`, border: `1px solid ${color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', color,
        }}>
            <i className={icon}></i>
        </div>
        <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1, fontFamily: 'Space Grotesk, sans-serif' }}>{value}</div>
            <div style={{ fontSize: '0.78rem', color: C.muted, fontWeight: 600, marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
        </div>
    </div>
);

const AdminFeedback = () => {
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedItem, setExpandedItem] = useState(null);

    const fetchFeedbacks = useCallback(async () => {
        setLoading(true);
        setError('');
        const result = await apiService.getFeedback();
        if (result.success) {
            setFeedbacks(result.data || []);
        } else {
            if (result.status === 401 || result.status === 403) {
                navigate('/admin-login');
            } else {
                setError(result.error || 'Failed to load feedback.');
            }
        }
        setLoading(false);
    }, [navigate]);

    useEffect(() => {
        if (!apiService.isAuthenticated()) { navigate('/admin-login'); return; }
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    const stats = useMemo(() => {
        const total = feedbacks.length;
        const avgOverall = total > 0 ? (feedbacks.reduce((acc, f) => acc + f.overall_rating, 0) / total).toFixed(1) : 0;
        const avgConcepts = total > 0 ? (feedbacks.reduce((acc, f) => acc + f.practical_concepts_rating, 0) / total).toFixed(1) : 0;
        return { total, avgOverall, avgConcepts };
    }, [feedbacks]);

    const formatDate = (isoStr) => {
        if (!isoStr) return '—';
        return new Date(isoStr).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    };

    const FeedbackCard = ({ fb }) => {
        const isExpanded = expandedItem === fb.id;

        return (
            <div style={{
                background: C.glass, backdropFilter: 'blur(18px)',
                border: `1px solid ${isExpanded ? C.accentCyan + '60' : C.border}`,
                borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s ease',
                boxShadow: isExpanded ? `0 0 30px ${C.accent}20` : 'none',
                marginBottom: '1rem'
            }}>
                <div
                    onClick={() => setExpandedItem(isExpanded ? null : fb.id)}
                    style={{
                        padding: '1.25rem 1.5rem', cursor: 'pointer',
                        display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto',
                        gap: '1rem', alignItems: 'center',
                        background: isExpanded ? 'rgba(0,102,255,0.05)' : 'transparent',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px',
                            background: `linear-gradient(135deg, ${C.accent}30, ${C.accentCyan}20)`,
                            border: `1px solid ${C.accent}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accentCyan,
                        }}>
                            <i className="fa-solid fa-user"></i>
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, color: C.text }}>{fb.name}</div>
                            <div style={{ fontSize: '0.8rem', color: C.muted }}>{fb.email} <span style={{ opacity: 0.5 }}>|</span> {fb.department} <span style={{ opacity: 0.5 }}>|</span> Year: {fb.year} <span style={{ opacity: 0.5 }}>|</span> Moodle: {fb.moodle_id}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <span style={{ fontSize: '0.75rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overall</span>
                        <Badge color={fb.overall_rating >= 4 ? C.accentGreen : (fb.overall_rating === 3 ? C.accentYellow : C.accentRed)}>
                            {fb.overall_rating} / 5 <i className="fa-solid fa-star"></i>
                        </Badge>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <span style={{ fontSize: '0.75rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Submitted</span>
                        <span style={{ fontSize: '0.85rem', color: C.text }}>{formatDate(fb.created_at)}</span>
                    </div>

                    <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`} style={{ color: C.muted }}></i>
                </div>

                {isExpanded && (
                    <div style={{ padding: '0 1.5rem 1.5rem', borderTop: `1px solid ${C.border}`, paddingTop: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.75rem', color: C.muted, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Ratings</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                    <span>Practical Concepts:</span> <span style={{ color: C.accentCyan, fontWeight: 700 }}>{fb.practical_concepts_rating} / 5</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                    <span>Interest Level:</span> <span style={{ color: C.accentCyan, fontWeight: 700 }}>{fb.interesting_rating}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span>Difficulty:</span> <span style={{ color: C.accentCyan, fontWeight: 700 }}>{fb.difficulty_rating}</span>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.75rem', color: C.muted, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Feedback Analytics</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                    <span>Enjoyed Category:</span> <span style={{ color: C.accentGreen, fontWeight: 700 }}>{fb.enjoyed_category}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                    <span>Improved Skills:</span> <span style={{ color: C.accentGreen, fontWeight: 700 }}>{fb.improved_skills}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span>Encouraged Teamwork:</span> <span style={{ color: C.accentGreen, fontWeight: 700 }}>{fb.encouraged_teamwork}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.75rem', color: C.muted, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Valuable Learning</div>
                                <div style={{ fontSize: '0.9rem', color: C.text, lineHeight: 1.5 }}>{fb.valuable_learning}</div>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.75rem', color: C.muted, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Challenges Faced</div>
                                <div style={{ fontSize: '0.9rem', color: C.text, lineHeight: 1.5 }}>{fb.challenges_faced}</div>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.75rem', color: C.muted, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Suggestions</div>
                                <div style={{ fontSize: '0.9rem', color: C.text, lineHeight: 1.5 }}>{fb.suggestions}</div>
                            </div>
                            {fb.liked_challenges && (
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '0.75rem', color: C.muted, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Specific Challenges Liked</div>
                                    <div style={{ fontSize: '0.9rem', color: C.text, lineHeight: 1.5 }}>{fb.liked_challenges}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ minHeight: '100vh', paddingTop: '90px', paddingBottom: '4rem', color: C.text, position: 'relative', zIndex: 10 }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: `linear-gradient(135deg, ${C.accent}, ${C.accentCyan})`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.1rem'
                            }}>
                                <i className="fa-solid fa-comments"></i>
                            </div>
                            <h1 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.8rem', fontWeight: 800 }}>CTF <span style={{ color: C.accentCyan }}>Feedback</span></h1>
                        </div>
                        <p style={{ margin: 0, color: C.muted, fontSize: '0.9rem' }}>Admin view — Review all player feedback from the latest CTF.</p>
                    </div>

                    <button onClick={fetchFeedbacks} style={{
                        padding: '0.65rem 0.75rem', borderRadius: '10px', border: `1px solid ${C.border}`,
                        background: 'transparent', color: C.muted, cursor: 'pointer', transition: 'all 0.25s'
                    }}>
                        <i className="fa-solid fa-rotate-right"></i>
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                    <StatCard icon="fa-solid fa-users" value={stats.total} label="Total Responses" color={C.accent} />
                    <StatCard icon="fa-solid fa-star" value={stats.avgOverall} label="Avg Overall Rating" color={C.accentYellow} />
                    <StatCard icon="fa-solid fa-book-open" value={stats.avgConcepts} label="Avg Concepts Rating" color={C.accentCyan} />
                </div>

                {error && (
                    <div style={{ padding: '1rem', background: `${C.accentRed}15`, border: `1px solid ${C.accentRed}40`, color: C.accentRed, borderRadius: '12px', marginBottom: '1.5rem' }}>
                        <i className="fa-solid fa-triangle-exclamation"></i> {error}
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: C.muted }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i></div>
                ) : feedbacks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: C.muted }}>
                        <div style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '1rem' }}><i className="fa-solid fa-inbox"></i></div>
                        No feedback responses yet.
                    </div>
                ) : (
                    <div>
                        {feedbacks.map(fb => <FeedbackCard key={fb.id} fb={fb} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminFeedback;
