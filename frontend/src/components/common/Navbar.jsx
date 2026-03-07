import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

const Navbar = ({ isDarkMode, toggleTheme }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [isLoggedIn, setIsLoggedIn] = useState(() => apiService.isAuthenticated());
    const navigate = useNavigate();

    const scrollToSection = (id) => {
        setIsMenuOpen(false);
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

    const handleLogout = async () => {
        await apiService.logout();
        setIsLoggedIn(false);
        navigate('/');
    };

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['home', 'about', 'learn', 'events', 'members', 'contact'];
            for (const section of sections) {
                const el = document.getElementById(section);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 100 && rect.bottom >= 100) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav>
            <div className="logo hover-trigger" onClick={() => scrollToSection('home')} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/images/Club Logo.png" alt="APSIT CyberSec" style={{ height: '40px', width: 'auto' }} />
                <span style={{ fontFamily: "'Nippo', sans-serif" }}>CYBERSECURITY<span style={{ color: 'var(--accent-primary)' }}>.CLUB</span></span>
            </div>

            <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                <li><a onClick={() => scrollToSection('home')} className={`nav-link hover-trigger ${activeSection === 'home' ? 'active' : ''}`}>Home</a></li>
                <li><a onClick={() => scrollToSection('about')} className={`nav-link hover-trigger ${activeSection === 'about' ? 'active' : ''}`}>Mission</a></li>
                <li><a onClick={() => scrollToSection('learn')} className={`nav-link hover-trigger ${activeSection === 'learn' ? 'active' : ''}`}>Training</a></li>
                <li><a onClick={() => scrollToSection('events')} className={`nav-link hover-trigger ${activeSection === 'events' ? 'active' : ''}`}>Events</a></li>
                <li><a onClick={() => scrollToSection('members')} className={`nav-link hover-trigger ${activeSection === 'members' ? 'active' : ''}`}>Squadron</a></li>
                <li><a onClick={() => scrollToSection('contact')} className={`nav-link hover-trigger ${activeSection === 'contact' ? 'active' : ''}`}>Contact</a></li>
                <li><a onClick={() => { navigate('/learning'); setIsMenuOpen(false); }} className="nav-link hover-trigger">Learning Lab</a></li>
                {/* <li><a onClick={() => { navigate('/resources'); setIsMenuOpen(false); }} className="nav-link hover-trigger">Resources</a></li> */}

                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isLoggedIn ? (
                        <a className="nav-btn-special hover-trigger" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                            <i className="fa-solid fa-right-from-bracket"></i> Logout
                        </a>
                    ) : (
                        <a className="nav-btn-special hover-trigger" onClick={() => { navigate('/admin-login'); setIsMenuOpen(false); }} style={{ cursor: 'pointer' }}>
                            <i className="fa-solid fa-user-astronaut"></i> Admin Login
                        </a>
                    )}

                    <button id="theme-toggle" className="theme-btn hover-trigger" onClick={toggleTheme}>
                        <span className="icon">{isDarkMode ? '☀️' : '🌙'}</span>
                    </button>
                </li>
            </ul>

            <div className="hamburger hover-trigger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'}`}></i>
            </div>
        </nav>
    );
};

export default Navbar;
