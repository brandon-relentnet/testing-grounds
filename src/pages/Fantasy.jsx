// src/pages/Fantasy.jsx
import React, { useEffect, useState } from 'react';
import axios from '../axiosConfig'; // Use the configured instance
import LoginButton from '../features/yahoo/LoginButton';
import LeagueSelection from '../features/yahoo/LeagueSelection';

function Fantasy() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Added loading state

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await axios.get('/api/check-auth');
                console.log('User is authenticated');
                setIsAuthenticated(true);
            } catch {
                console.log('User is not authenticated');
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>; // Display a loading indicator
    }

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
