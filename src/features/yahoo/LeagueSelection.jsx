// src/features/yahoo/LeagueSelection.jsx
import React, { useEffect, useState } from 'react';
import axios from '../../axiosConfig';

const LeagueSelection = () => {
    const [leagues, setLeagues] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedGameKey, setSelectedGameKey] = useState('438'); // Default to NBA

    const handleGameChange = (e) => {
        setSelectedGameKey(e.target.value);
    };

    useEffect(() => {
        const fetchLeagues = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(`/api/fantasy-data?game_keys=${selectedGameKey}`);
                console.log('Fetched Fantasy Data:', response.data);
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
    }, [selectedGameKey]);

    const parseLeagues = (data) => {
        try {
            if (!data?.fantasy_content?.users?.length) {
                console.warn('No users found in the fantasy data.');
                return [];
            }

            const user = data.fantasy_content.users[0].user;

            if (!user?.games?.length) {
                console.warn('No games found for the user.');
                return [];
            }

            const game = user.games[0].game;

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

    return (
        <div>
            <h2>Select a League</h2>
            <div>
                <label htmlFor="game-select">Select Sport: </label>
                <select id="game-select" value={selectedGameKey} onChange={handleGameChange}>
                    <option value="438">NBA (Basketball)</option>
                    <option value="449">NFL (Football)</option>
                    <option value="442">MLB (Baseball)</option>
                    <option value="445">NHL (Hockey)</option>
                    {/* Add more options as needed */}
                </select>
            </div>
            {isLoading ? (
                <div>Loading leagues...</div>
            ) : error ? (
                <div>{error}</div>
            ) : leagues.length > 0 ? (
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
