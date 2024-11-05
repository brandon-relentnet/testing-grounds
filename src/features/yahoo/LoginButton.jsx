// src/features/yahoo/LoginButton.js
import React from 'react';

const LoginButton = () => {
    const handleLogin = () => {
        // If backend is on a different subdomain, specify the full URL
        window.location.href = 'https://fantasy.fleetingfascinations.com/auth/yahoo'; // Adjust if backend is on a different subdomain
    };

    return (
        <button
            onClick={handleLogin}
            className='bg-surface0 p-4 m-4'
            aria-label="Log in with Yahoo"
        >
            Log in with Yahoo
        </button>
    );
};

export default LoginButton;
