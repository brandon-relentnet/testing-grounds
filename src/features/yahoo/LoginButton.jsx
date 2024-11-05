// LoginButton.js
import React from 'react';

const LoginButton = () => {
    const handleLogin = () => {
        window.location.href = 'https://fantasy.fleetingfascinations.com/auth/yahoo';
    };

    return (
        <button onClick={handleLogin} style={{ padding: '10px', fontSize: '16px' }}>
            Log in with Yahoo
        </button>
    );
};

export default LoginButton;
