import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

/* ── constants ─────────────────────────────────────────────────── */
const DEPARTMENTS = ['All', 'Computer Engineering', 'CSE AI and ML', 'CSE Data Science', 'Information Technology'];
const YEARS = ['All', 'First Year', 'Second Year', 'Third Year', 'Fourth Year'];
const DIVISIONS = ['All', 'A', 'B', 'C', 'D', 'E'];
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'team_name_asc', label: 'Team Name A–Z' },
    { value: 'team_name_desc', label: 'Team Name Z–A' },
    { value: 'member_count', label: 'Member Count' },
];

/* ── tiny design tokens ───────────────────────────────────────── */
const C = {
    base: '#050a10',
    glass: 'rgba(20,30,50,0.7)',
    glassBright: 'rgba(30,45,70,0.9)',
    border: 'rgba(0,102,255,0.18)',
    borderHover: 'rgba(0,194,255,0.5)',
    accent: '#0066ff',
    accentCyan: '#00c2ff',
    accentGreen: '#00cc66',
    accentRed: '#ff3366',
    accentYellow: '#f59e0b',
    text: '#e0e6ed',
    muted: '#94a3b8',
    leader: 'rgba(0,204,102,0.15)',
    leaderBorder: '#00cc66',
};

/* ── helper components ─────────────────────────────────────────── */
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

const FilterSelect = ({ label, value, onChange, options, icon }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, minWidth: '140px' }}>
        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <i className={icon} style={{ color: C.accentCyan }}></i> {label}
        </label>
        <select value={value} onChange={onChange} style={{
            background: 'rgba(10,18,35,0.9)', border: `1px solid ${C.border}`,
            borderRadius: '10px', color: C.text, padding: '0.6rem 0.9rem',
            fontSize: '0.88rem', outline: 'none', cursor: 'pointer',
            transition: 'border-color 0.25s',
        }}>
            {options.map(o => (
                <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
                    {typeof o === 'string' ? o : o.label}
                </option>
            ))}
        </select>
    </div>
);

/* ── main component ────────────────────────────────────────────── */
const AdminTeams = () => {
    const navigate = useNavigate();

    /* state */
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedTeam, setExpandedTeam] = useState(null);
    const [exporting, setExporting] = useState(false);

    /* filters */
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('All');
    const [filterYear, setFilterYear] = useState('All');
    const [filterDiv, setFilterDiv] = useState('All');
    const [filterSize, setFilterSize] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

    /* ── load teams ── */
    const fetchTeams = useCallback(async () => {
        setLoading(true);
        setError('');
        const params = {};
        if (filterDept !== 'All') params.department = filterDept;
        if (filterYear !== 'All') params.year = filterYear;
        if (filterDiv !== 'All') params.division = filterDiv;
        if (search.trim()) params.search = search.trim();

        const result = await apiService.getHackathonTeams(params);
        if (result.success) {
            setTeams(result.data || []);
        } else {
            if (result.status === 401 || result.status === 403) {
                navigate('/admin-login');
            } else {
                setError(result.error || 'Failed to load teams.');
            }
        }
        setLoading(false);
    }, [filterDept, filterYear, filterDiv, search, navigate]);

    useEffect(() => {
        if (!apiService.isAuthenticated()) { navigate('/admin-login'); return; }
        fetchTeams();
    }, [fetchTeams]);

    /* ── client-side sort + size filter ── */
    const displayTeams = useMemo(() => {
        let list = [...teams];
        if (filterSize !== 'All') {
            const size = parseInt(filterSize);
            list = list.filter(t => t.members && t.members.length === size);
        }
        switch (sortBy) {
            case 'oldest': list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); break;
            case 'team_name_asc': list.sort((a, b) => a.team_name.localeCompare(b.team_name)); break;
            case 'team_name_desc': list.sort((a, b) => b.team_name.localeCompare(a.team_name)); break;
            case 'member_count': list.sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0)); break;
            default: list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        return list;
    }, [teams, filterSize, sortBy]);

    /* ── aggregated stats ── */
    const stats = useMemo(() => {
        const allMembers = teams.flatMap(t => t.members || []);
        const deptCounts = {};
        allMembers.forEach(m => { deptCounts[m.department] = (deptCounts[m.department] || 0) + 1; });
        const topDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
        return {
            totalTeams: teams.length,
            totalMembers: allMembers.length,
            leaders: allMembers.filter(m => m.is_leader).length,
            topDept,
        };
    }, [teams]);

    /* ── handlers ── */
    const handleExport = async () => {
        setExporting(true);
        await apiService.exportHackathonTeamsCSV();
        setExporting(false);
    };

    const clearFilters = () => {
        setSearch(''); setFilterDept('All'); setFilterYear('All');
        setFilterDiv('All'); setFilterSize('All'); setSortBy('newest');
    };

    const formatDate = (isoStr) => {
        if (!isoStr) return '—';
        return new Date(isoStr).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    };

    /* ── member row ── */
    const MemberRow = ({ member, isLeader }) => (
        <div style={{
            display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 0.7fr 0.7fr 0.6fr',
            gap: '0.75rem', padding: '0.7rem 1rem', borderRadius: '10px',
            background: isLeader ? C.leader : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isLeader ? C.leaderBorder + '50' : 'rgba(255,255,255,0.06)'}`,
            marginBottom: '0.4rem', alignItems: 'center',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                    width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                    background: isLeader ? `${C.accentGreen}22` : `${C.accent}18`,
                    border: `1px solid ${isLeader ? C.accentGreen : C.accent}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', color: isLeader ? C.accentGreen : C.accent,
                    fontWeight: 700,
                }}>
                    {member.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ color: C.text, fontWeight: 600, fontSize: '0.88rem' }}>{member.name}</span>
            </div>
            <span style={{ color: C.muted, fontSize: '0.82rem', wordBreak: 'break-all' }}>{member.email}</span>
            <span style={{ color: C.accentCyan, fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 600 }}>{member.moodle_id}</span>
            <span style={{ color: C.text, fontSize: '0.82rem' }}>{member.department}</span>
            <span style={{ color: C.muted, fontSize: '0.82rem' }}>{member.year || '—'}</span>
            <span style={{ color: C.muted, fontSize: '0.82rem' }}>{member.division || '—'}</span>
            <div>
                {isLeader
                    ? <Badge color={C.accentGreen}><i className="fa-solid fa-crown"></i> Leader</Badge>
                    : <Badge color={C.muted}><i className="fa-solid fa-user"></i> Member</Badge>}
            </div>
        </div>
    );

    /* ── team card ── */
    const TeamCard = ({ team }) => {
        const isExpanded = expandedTeam === team.id;
        const leader = team.members?.find(m => m.is_leader);
        const memberCount = team.members?.length || 0;

        return (
            <div style={{
                background: C.glass, backdropFilter: 'blur(18px)',
                border: `1px solid ${isExpanded ? C.accentCyan + '60' : C.border}`,
                borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s ease',
                boxShadow: isExpanded ? `0 0 30px ${C.accent}20` : 'none',
            }}>
                {/* Card Header */}
                <div
                    onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                    style={{
                        padding: '1.25rem 1.5rem', cursor: 'pointer',
                        display: 'grid', gridTemplateColumns: '1fr auto auto auto',
                        gap: '1rem', alignItems: 'center',
                        background: isExpanded ? 'rgba(0,102,255,0.05)' : 'transparent',
                        transition: 'background 0.3s',
                    }}
                >
                    {/* Team Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                            background: `linear-gradient(135deg, ${C.accent}30, ${C.accentCyan}20)`,
                            border: `1px solid ${C.accent}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.1rem', color: C.accentCyan,
                        }}>
                            <i className="fa-solid fa-users-viewfinder"></i>
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: C.text, fontFamily: 'Space Grotesk, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {team.team_name}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: C.muted, marginTop: '0.15rem' }}>
                                <i className="fa-solid fa-calendar-days" style={{ color: C.accentCyan, marginRight: '0.4rem' }}></i>
                                {formatDate(team.created_at)}
                                {leader && (
                                    <span style={{ marginLeft: '0.75rem' }}>
                                        <i className="fa-solid fa-crown" style={{ color: C.accentYellow, marginRight: '0.3rem' }}></i>
                                        {leader.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Dept badges */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {[...new Set(team.members?.map(m => m.department) || [])].map(dept => (
                            <Badge key={dept} color={C.accentCyan}>{dept.replace('Computer Engineering', 'CE').replace('Information Technology', 'IT').replace('CSE AI and ML', 'AI/ML').replace('CSE Data Science', 'DS')}</Badge>
                        ))}
                    </div>

                    {/* Member count */}
                    <Badge color={memberCount === 3 ? C.accentYellow : C.accentGreen}>
                        <i className="fa-solid fa-users"></i> {memberCount} members
                    </Badge>

                    {/* Expand icon */}
                    <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`}
                        style={{ color: C.muted, fontSize: '0.85rem', transition: 'transform 0.3s' }}></i>
                </div>

                {/* Expanded members */}
                {isExpanded && (
                    <div style={{ padding: '0 1.5rem 1.5rem', borderTop: `1px solid ${C.border}`, paddingTop: '1.25rem' }}>
                        {/* Column headers */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 0.7fr 0.7fr 0.6fr',
                            gap: '0.75rem', padding: '0.4rem 1rem', marginBottom: '0.5rem',
                        }}>
                            {['Full Name', 'Email', 'Moodle ID', 'Department', 'Year', 'Division', 'Role'].map(h => (
                                <span key={h} style={{ fontSize: '0.68rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.7px' }}>{h}</span>
                            ))}
                        </div>
                        {team.members?.map(m => (
                            <MemberRow key={m.id || m.moodle_id} member={m} isLeader={m.is_leader} />
                        ))}
                        {/* Per-team export */}
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => apiService.exportHackathonTeamsCSV()}
                                style={{
                                    padding: '0.5rem 1.2rem', background: 'transparent',
                                    border: `1px solid ${C.accentGreen}60`, borderRadius: '8px',
                                    color: C.accentGreen, fontSize: '0.8rem', fontWeight: 700,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                }}
                            >
                                <i className="fa-solid fa-file-csv"></i> Export this Team
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    /* ── table view ── */
    const TableView = () => (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                        {['Team', 'Leader', 'Email', 'Moodle ID', 'Department', 'Year', 'Div', 'Role', 'Registered'].map(h => (
                            <th key={h} style={{ padding: '0.75rem 0.85rem', color: C.muted, fontWeight: 700, textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {displayTeams.flatMap(team =>
                        (team.members || []).map((m, idx) => (
                            <tr key={`${team.id}-${m.id || idx}`} style={{
                                borderBottom: `1px solid ${C.border}`,
                                background: m.is_leader ? C.leader : (idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'),
                                transition: 'background 0.2s',
                            }}>
                                <td style={{ padding: '0.7rem 0.85rem', color: C.accent, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', whiteSpace: 'nowrap' }}>
                                    {idx === 0 ? team.team_name : <span style={{ color: C.muted, fontStyle: 'italic', fontWeight: 400 }}>↳ {team.team_name}</span>}
                                </td>
                                <td style={{ padding: '0.7rem 0.85rem', color: C.text, fontWeight: 600 }}>{m.name}</td>
                                <td style={{ padding: '0.7rem 0.85rem', color: C.muted }}>{m.email}</td>
                                <td style={{ padding: '0.7rem 0.85rem', color: C.accentCyan, fontFamily: 'monospace', fontWeight: 600 }}>{m.moodle_id}</td>
                                <td style={{ padding: '0.7rem 0.85rem', color: C.text }}>{m.department}</td>
                                <td style={{ padding: '0.7rem 0.85rem', color: C.muted, whiteSpace: 'nowrap' }}>{m.year || '—'}</td>
                                <td style={{ padding: '0.7rem 0.85rem', color: C.muted }}>{m.division || '—'}</td>
                                <td style={{ padding: '0.7rem 0.85rem' }}>
                                    {m.is_leader
                                        ? <Badge color={C.accentGreen}><i className="fa-solid fa-crown"></i></Badge>
                                        : <Badge color={C.muted}><i className="fa-solid fa-user"></i></Badge>}
                                </td>
                                <td style={{ padding: '0.7rem 0.85rem', color: C.muted, whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                                    {idx === 0 ? formatDate(team.created_at) : ''}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    /* ── render ─────────────────────────────────────────────────── */
    const activeFilters = [
        search && `Search: "${search}"`,
        filterDept !== 'All' && `Dept: ${filterDept}`,
        filterYear !== 'All' && `Year: ${filterYear}`,
        filterDiv !== 'All' && `Div: ${filterDiv}`,
        filterSize !== 'All' && `Size: ${filterSize}`,
    ].filter(Boolean);

    return (
        <div style={{ minHeight: '100vh', background: 'transparent', paddingTop: '90px', paddingBottom: '4rem', color: C.text, position: 'relative', zIndex: 10 }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>

                {/* ── Page Header ── */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '12px',
                                    background: `linear-gradient(135deg, ${C.accent}, ${C.accentCyan})`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.1rem', color: '#fff',
                                }}>
                                    <i className="fa-solid fa-shield-halved"></i>
                                </div>
                                <h1 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: C.text }}>
                                    Hackathon <span style={{ color: C.accentCyan }}>Teams</span>
                                </h1>
                            </div>
                            <p style={{ margin: 0, color: C.muted, fontSize: '0.9rem' }}>
                                Admin view — All registered teams and member details.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            {/* View toggle */}
                            <div style={{ display: 'flex', gap: '0.3rem', background: C.glass, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '0.25rem' }}>
                                {[['fa-solid fa-id-card', 'cards'], ['fa-solid fa-table-list', 'table']].map(([ico, mode]) => (
                                    <button key={mode} onClick={() => setViewMode(mode)} style={{
                                        padding: '0.5rem 0.85rem', border: 'none', borderRadius: '8px', cursor: 'pointer',
                                        background: viewMode === mode ? C.accent : 'transparent', color: viewMode === mode ? '#fff' : C.muted,
                                        fontSize: '0.85rem', transition: 'all 0.2s',
                                    }}>
                                        <i className={ico}></i>
                                    </button>
                                ))}
                            </div>
                            {/* Export */}
                            <button onClick={handleExport} disabled={exporting} style={{
                                padding: '0.65rem 1.4rem', borderRadius: '10px', border: `1px solid ${C.accentGreen}50`,
                                background: `${C.accentGreen}12`, color: C.accentGreen, fontWeight: 700, fontSize: '0.88rem',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                transition: 'all 0.25s',
                            }}>
                                {exporting
                                    ? <><i className="fa-solid fa-spinner fa-spin"></i> Exporting…</>
                                    : <><i className="fa-solid fa-file-csv"></i> Export CSV</>}
                            </button>
                            {/* Refresh */}
                            <button onClick={fetchTeams} style={{
                                padding: '0.65rem 0.75rem', borderRadius: '10px', border: `1px solid ${C.border}`,
                                background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: '0.9rem',
                                transition: 'all 0.25s',
                            }}>
                                <i className="fa-solid fa-rotate-right"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Stats Row ── */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <StatCard icon="fa-solid fa-users-viewfinder" value={stats.totalTeams} label="Total Teams" color={C.accent} />
                    <StatCard icon="fa-solid fa-users" value={stats.totalMembers} label="Total Members" color={C.accentCyan} />
                    <StatCard icon="fa-solid fa-crown" value={stats.leaders} label="Team Leaders" color={C.accentYellow} />
                    <StatCard icon="fa-solid fa-building-columns" value={stats.topDept} label="Top Dept" color={C.accentGreen} />
                </div>

                {/* ── Filters Panel ── */}
                <div style={{
                    background: C.glass, border: `1px solid ${C.border}`,
                    borderRadius: '16px', padding: '1.5rem', marginBottom: '1.75rem',
                    backdropFilter: 'blur(18px)',
                }}>
                    {/* Search */}
                    <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                        <i className="fa-solid fa-magnifying-glass" style={{
                            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                            color: C.muted, fontSize: '0.9rem',
                        }}></i>
                        <input
                            type="text" value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by team name, member name, email, or moodle ID…"
                            style={{
                                width: '100%', padding: '0.8rem 1rem 0.8rem 2.75rem',
                                background: 'rgba(10,18,35,0.9)', border: `1px solid ${C.border}`,
                                borderRadius: '12px', color: C.text, fontSize: '0.92rem',
                                outline: 'none', boxSizing: 'border-box',
                                transition: 'border-color 0.25s',
                            }}
                        />
                    </div>

                    {/* Filter row */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <FilterSelect label="Department" value={filterDept} onChange={e => setFilterDept(e.target.value)} options={DEPARTMENTS} icon="fa-solid fa-building" />
                        <FilterSelect label="Year" value={filterYear} onChange={e => setFilterYear(e.target.value)} options={YEARS} icon="fa-solid fa-graduation-cap" />
                        <FilterSelect label="Division" value={filterDiv} onChange={e => setFilterDiv(e.target.value)} options={DIVISIONS} icon="fa-solid fa-layer-group" />
                        <FilterSelect label="Team Size" value={filterSize} onChange={e => setFilterSize(e.target.value)} options={['All', '3', '4']} icon="fa-solid fa-users" />
                        <FilterSelect label="Sort By" value={sortBy} onChange={e => setSortBy(e.target.value)} options={SORT_OPTIONS} icon="fa-solid fa-sort" />

                        {activeFilters.length > 0 && (
                            <button onClick={clearFilters} style={{
                                alignSelf: 'flex-end', padding: '0.6rem 1.1rem', borderRadius: '10px',
                                border: `1px solid ${C.accentRed}50`, background: `${C.accentRed}10`,
                                color: C.accentRed, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                            }}>
                                <i className="fa-solid fa-xmark"></i> Clear All
                            </button>
                        )}
                    </div>

                    {/* Active filter pills */}
                    {activeFilters.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.75rem', color: C.muted, alignSelf: 'center' }}>Active:</span>
                            {activeFilters.map(f => (
                                <span key={f} style={{
                                    padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem',
                                    background: `${C.accent}18`, color: C.accentCyan, border: `1px solid ${C.accent}30`, fontWeight: 600,
                                }}>
                                    {f}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Results summary ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: C.muted }}>
                        Showing <strong style={{ color: C.accentCyan }}>{displayTeams.length}</strong> of{' '}
                        <strong style={{ color: C.text }}>{teams.length}</strong> teams
                    </span>
                    {loading && <span style={{ fontSize: '0.82rem', color: C.muted }}><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.4rem' }}></i> Refreshing…</span>}
                </div>

                {/* ── Error state ── */}
                {error && (
                    <div style={{
                        padding: '1.25rem 1.5rem', borderRadius: '12px',
                        background: `${C.accentRed}15`, border: `1px solid ${C.accentRed}40`,
                        color: C.accentRed, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    }}>
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        {error}
                        <button onClick={fetchTeams} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: C.accentRed, cursor: 'pointer', fontWeight: 700 }}>
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Loading skeleton ── */}
                {loading && displayTeams.length === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{
                                height: '78px', borderRadius: '16px',
                                background: 'linear-gradient(90deg, rgba(20,30,50,0.6) 0%, rgba(30,50,80,0.4) 50%, rgba(20,30,50,0.6) 100%)',
                                backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
                                border: `1px solid ${C.border}`,
                            }}></div>
                        ))}
                    </div>
                )}

                {/* ── Empty state ── */}
                {!loading && displayTeams.length === 0 && !error && (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', color: C.muted }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}>🔍</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: C.text, marginBottom: '0.5rem' }}>No teams found</div>
                        <div style={{ fontSize: '0.9rem' }}>Try adjusting your filters or search term.</div>
                        {activeFilters.length > 0 && (
                            <button onClick={clearFilters} style={{ marginTop: '1rem', padding: '0.6rem 1.4rem', borderRadius: '10px', border: `1px solid ${C.accent}`, background: 'transparent', color: C.accent, fontWeight: 700, cursor: 'pointer' }}>
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}

                {/* ── Content ── */}
                {!loading && displayTeams.length > 0 && (
                    viewMode === 'table'
                        ? (
                            <div style={{
                                background: C.glass, border: `1px solid ${C.border}`,
                                borderRadius: '16px', overflow: 'hidden',
                                backdropFilter: 'blur(18px)',
                            }}>
                                <TableView />
                            </div>
                        )
                        : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {displayTeams.map(team => (
                                    <TeamCard key={team.id} team={team} />
                                ))}
                            </div>
                        )
                )}
            </div>

            {/* shimmer keyframe */}
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
};

export default AdminTeams;
