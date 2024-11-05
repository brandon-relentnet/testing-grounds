// LeagueSelection.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LeagueSelection = () => {
    const [leagues, setLeagues] = useState([]);

    useEffect(() => {
        const fetchLeagues = async () => {
            try {
                const response = await axios.get('/api/fantasy-data', { withCredentials: true });
                // Parse and set leagues
            } catch (error) {
                console.error('Error fetching leagues:', error);
            }
        };
        fetchLeagues();
    }, []);


    return (
        <div>
            <h2>Select a League</h2>
            {leagues.length > 0 ? (
                <ul>
                    {leagues.map((league) => (
                        <li key={league.league_id}>{league.name}</li>
                    ))}
                </ul>
            ) : (
                <p>No leagues available.</p>
            )}
        </div>
    );
};

export default LeagueSelection;
