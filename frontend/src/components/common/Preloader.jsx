import React from 'react';

const Preloader = ({ isLoading }) => {
    return (
        <div id="preloader" style={{
            opacity: isLoading ? 1 : 0,
            visibility: isLoading ? 'visible' : 'hidden',
            pointerEvents: isLoading ? 'all' : 'none'
        }}>
            <div className="loader-content">
                <img src="/images/Club Logo.png" alt="Cyber Club Logo" className="loader-logo" />
                <div className="loader-text">Welcome to APSIT Cyber Security</div>
                <div className="loader-bar-container">
                    <div className="loader-bar"></div>
                </div>
            </div>
        </div>
    );
};

export default Preloader;
