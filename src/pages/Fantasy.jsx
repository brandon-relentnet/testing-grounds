// src/pages/About.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoginButton from '../features/yahoo/LoginButton';
import LeagueSelection from '../features/yahoo/LeagueSelection';

function Fantasy() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await axios.get('/api/check-auth', { withCredentials: true });
                console.log('User is authenticated');
                setIsAuthenticated(true);
            } catch {
                console.log('User is not authenticated');
                setIsAuthenticated(false);
            }
        };
        checkAuth();
    }, []);

    return (
        <div className="App">
            <h1>Welcome to Fantasy Manager</h1>
            {isAuthenticated ? (
                <LeagueSelection />
            ) : (
                <LoginButton />
            )}
        </div>
    );
}

export default Fantasy;
