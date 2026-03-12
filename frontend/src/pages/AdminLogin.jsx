import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await apiService.login(username, password);
        if (result.success) {
            navigate('/admin/feedback');
        } else {
            setError(result.error || 'Identity Verification Failed');
        }
        setIsLoading(false);
    };

    return (
        <div className="login-container" style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            padding: '2rem', background: 'var(--bg-base)'
        }}>
            <div className="cyber-modal active" style={{
                maxWidth: '450px', width: '100%',
                position: 'relative', display: 'block',
                boxShadow: '0 0 50px rgba(0, 102, 255, 0.2)'
            }}>
                <div className="cyber-scanline"></div>
                <div className="modal-header">
                    <div className="modal-title">
                        <i className="fa-solid fa-terminal"></i> SYSTEM ACCESS PROTOCOL
                    </div>
                </div>

                <div className="modal-body" style={{ padding: '2.5rem' }}>
                    <form onSubmit={handleLogin}>
                        <div className="cyber-input-group">
                            <input
                                type="text"
                                className="cyber-input"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <span className="input-bar"></span>
                            <label className="cyber-label">Admin Username</label>
                        </div>

                        <div className="cyber-input-group">
                            <input
                                type="password"
                                className="cyber-input"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <span className="input-bar"></span>
                            <label className="cyber-label">Access Key (Password)</label>
                        </div>

                        {error && (
                            <div style={{ color: 'var(--accent-alert)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                                <i className="fa-solid fa-triangle-exclamation"></i> {error}
                            </div>
                        )}

                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
                            {isLoading
                                ? <i className="fa-solid fa-spinner fa-spin"></i>
                                : <><i className="fa-solid fa-unlock"></i> Authenticate</>
                            }
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <p>Unauthorized access is strictly prohibited and monitored.</p>
                        <a onClick={() => navigate('/')} style={{ color: 'var(--accent-primary)', cursor: 'pointer', textDecoration: 'underline' }}>
                            Return to Safe Zone
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
