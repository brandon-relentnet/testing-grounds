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
                console.log('Fetched Fantasy Data:', response.data); // Add this line
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
        try {
            // Check if 'users' array exists and has at least one user
            if (!data?.fantasy_content?.users?.length) {
                console.warn('No users found in the fantasy data.');
                return [];
            }

            const user = data.fantasy_content.users[0].user;

            // Check if 'games' array exists and has at least one game
            if (!user?.games?.length) {
                console.warn('No games found for the user.');
                return [];
            }

            const game = user.games[0].game;

            // Check if 'leagues' and 'league' exist
            const leaguesData = game?.leagues?.league;

            if (!leaguesData) {
                console.warn('No leagues found for the game.');
                return [];
            }

            if (Array.isArray(leaguesData)) {
                return leaguesData.map(league => ({
                    league_id: league.league_id,
                    name: league.name,
                    // Add other fields as needed
                }));
            } else if (typeof leaguesData === 'object') {
                // Single league scenario
                return [{
                    league_id: leaguesData.league_id,
                    name: leaguesData.name,
                    // Add other fields as needed
                }];
            } else {
                console.warn('Unexpected leagues data structure:', leaguesData);
                return [];
            }
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
                <p>You are not part of any leagues. Please create or join a league to continue.</p>
            )}
        </div>
    );
};

export default LeagueSelection;
