// src/features/yahoo/LeagueSelection.js
import React, { useEffect, useState } from 'react';
import axios from '../../axiosConfig'; // Use the configured Axios instance

const LeagueSelection = () => {
    const [leagues, setLeagues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeagues = async () => {
            try {
                const response = await axios.get('/api/fantasy-data');
                // Parse the response based on the actual API structure
                const fetchedLeagues = parseLeagues(response.data);
                setLeagues(fetchedLeagues);
            } catch (error) {
                console.error('Error fetching leagues:', error);
                setError('Failed to load leagues. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeagues();
    }, []);

    const parseLeagues = (data) => {
        // Implement parsing logic based on actual response
        // Example:
        try {
            const leaguesData = data.fantasy_content.users[0].user.games[0].game.leagues.league;
            return leaguesData.map(league => ({
                league_id: league.league_id,
                name: league.name,
                // Add other fields as needed
            }));
        } catch (err) {
            console.error('Error parsing leagues:', err);
            return [];
        }
    };

    if (isLoading) {
        return <div>Loading leagues...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

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
