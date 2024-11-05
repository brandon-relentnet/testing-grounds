// src/pages/About.jsx
import React, { useEffect, useState } from 'react';
import LoginButton from '../features/yahoo/LoginButton';

function About() {
    const [token, setToken] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('token');
        if (accessToken) {
            setToken(accessToken);
            // Optionally, store the token in localStorage or sessionStorage
            localStorage.setItem('accessToken', accessToken);
        }
    }, []);

    return (
        <div className="App">
            <h1>Welcome to Fantasy Manager</h1>
            {token ? (
                <LeagueSelection token={token} />
            ) : (
                <LoginButton />
            )}
        </div>
    );
}

export default About;
