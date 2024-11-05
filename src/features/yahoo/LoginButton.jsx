// LoginButton.js
import React from 'react';

const LoginButton = () => {
    const handleLogin = () => {
        window.location.href = '/auth/yahoo'; // Relative path to your backend endpoint
    };

    return (
        <button onClick={handleLogin} className='bg-surface0 p-4 m-4'>
            Log in with Yahoo
        </button>
    );
};

export default LoginButton;
