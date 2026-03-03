import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const LEVEL_CONFIG = {
    beginner: { label: 'Beginner', color: '#00cc66', icon: 'fa-seedling' },
    intermediate: { label: 'Intermediate', color: '#ffcc00', icon: 'fa-bolt' },
    advanced: { label: 'Advanced', color: '#ff3366', icon: 'fa-skull-crossbones' },
};

const Resources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [downloading, setDownloading] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResources = async () => {
            setLoading(true);
            setError('');
            const params = filter !== 'all' ? { level: filter } : {};
            const result = await apiService.getResources(params);
            if (result.success) {
                setResources(result.data);
            } else {
                setError('Could not load resources. Please try again later.');
            }
            setLoading(false);
        };
        fetchResources();
    }, [filter]);

    const handleDownload = async (resource) => {
        setDownloading(resource.id);
        const result = await apiService.downloadResource(resource.id, `${resource.title}.pdf`);
        if (!result.success) {
            alert(`Download failed: ${result.error}`);
        }
        setDownloading(null);
    };

    const filteredResources = resources.filter(r => filter === 'all' || r.level === filter);

    return (
        <div style={{ minHeight: '100vh', padding: '8rem 2rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 className="gradient-text section-title">
                    Resource <span>Library</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    Curated PDF guides and study materials — download anytime.
                </p>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
                {['all', 'beginner', 'intermediate', 'advanced'].map(level => (
                    <button
                        key={level}
                        onClick={() => setFilter(level)}
                        className="btn"
                        style={{
                            padding: '0.5rem 1.5rem',
                            background: filter === level ? 'var(--accent-primary)' : 'var(--bg-glass)',
                            color: filter === level ? '#fff' : 'var(--text-main)',
                            border: '1px solid var(--border-glass)',
                            borderColor: filter === level ? 'var(--accent-primary)' : undefined,
                            textTransform: 'capitalize',
                        }}
                    >
                        {level === 'all' ? 'All Levels' : level}
                    </button>
                ))}
            </div>

            {/* State: Loading */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}></i>
                    <p>Fetching resources...</p>
                </div>
            )}

            {/* State: Error */}
            {!loading && error && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--accent-alert)' }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
                    <p>{error}</p>
                </div>
            )}

            {/* State: Empty */}
            {!loading && !error && filteredResources.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-folder-open" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}></i>
                    <h3>No resources found</h3>
                    <p>{filter !== 'all' ? `No ${filter} level resources yet.` : 'The library is empty. Check back soon!'}</p>
                </div>
            )}

            {/* Resource Grid */}
            {!loading && !error && filteredResources.length > 0 && (
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                    {filteredResources.map(resource => {
                        const cfg = LEVEL_CONFIG[resource.level] || LEVEL_CONFIG.beginner;
                        return (
                            <div key={resource.id} className="card hover-trigger" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Level badge + icon */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span className="tag" style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}55` }}>
                                        <i className={`fa-solid ${cfg.icon}`} style={{ marginRight: '6px' }}></i>
                                        {cfg.label}
                                    </span>
                                    {resource.file_size && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {(resource.file_size / 1024 / 1024).toFixed(1)} MB
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{resource.title}</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        Added {new Date(resource.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>

                                {/* Download */}
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', marginTop: 'auto' }}
                                    disabled={downloading === resource.id}
                                    onClick={() => handleDownload(resource)}
                                >
                                    {downloading === resource.id ? (
                                        <><i className="fa-solid fa-spinner fa-spin"></i> Downloading...</>
                                    ) : (
                                        <><i className="fa-solid fa-download" style={{ marginRight: '8px' }}></i>Download PDF</>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Resources;
