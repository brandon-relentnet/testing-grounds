// src/features/yahoo/LoginButton.jsx
import React from 'react';

const LoginButton = () => {
    const handleLogin = () => {
        // Redirect to the backend's OAuth initiation route with prompt parameter to force consent
        window.location.href = 'https://fantasy.fleetingfascinations.com/auth/yahoo?prompt=consent';
    };

    return (
        <button
            onClick={handleLogin}
            className='bg-surface0 p-4 m-4'
            aria-label="Log in with Yahoo"
            style={buttonStyle}
        >
            Log in with Yahoo
        </button>
    );
};

const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#4A90E2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
};

export default LoginButton;
