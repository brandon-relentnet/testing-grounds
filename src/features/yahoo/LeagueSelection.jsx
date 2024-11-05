// LeagueSelection.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LeagueSelection = ({ token }) => {
    const [leagues, setLeagues] = useState([]);

    useEffect(() => {
        const fetchLeagues = async () => {
            try {
                const response = await axios.get('https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setLeagues(response.data); // Adjust according to the API response format
            } catch (error) {
                console.error('Error fetching leagues:', error);
            }
        };

        if (token) {
            fetchLeagues();
        }
    }, [token]);

    return (
        <div>
            <h2>Select a League</h2>
            <ul>
                {leagues.map((league) => (
                    <li key={league.id}>{league.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default LeagueSelection;
