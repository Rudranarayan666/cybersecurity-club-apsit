import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useParallax } from './hooks/useParallax';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CustomCursor from './components/visuals/CustomCursor';
import ThreeCanvas from './components/visuals/ThreeCanvas';
import Preloader from './components/common/Preloader';

// Pages — lazily loaded for code splitting
const Home = lazy(() => import('./pages/Home'));
const Learning = lazy(() => import('./pages/Learning'));
const Feedback = lazy(() => import('./pages/Feedback'));       // Individual Feedback
const AdminLogin = lazy(() => import('./pages/AdminLogin'));   // Admin login
const Resources = lazy(() => import('./pages/Resources'));
const AdminFeedback = lazy(() => import('./pages/AdminFeedback'));   // Admin feedback dashboard

function App() {
  useParallax(); // Attach the global scroll listener for the --scroll-y CSS variable

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || !localStorage.getItem('theme');
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.classList.add('loaded');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
        <Preloader isLoading={isLoading} />
        <CustomCursor />
        <ThreeCanvas isDarkMode={isDarkMode} />

        <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

        <main>
          <Suspense fallback={<div className="loading-fallback"><i className="fa-solid fa-spinner fa-spin"></i> Loading Module...</div>}>
            <Routes>
              <Route path="/" element={<Home isDarkMode={isDarkMode} />} />
              <Route path="/learning" element={<Learning isDarkMode={isDarkMode} />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin/feedback" element={<AdminFeedback />} />
              <Route path="/resources" element={<Resources />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
