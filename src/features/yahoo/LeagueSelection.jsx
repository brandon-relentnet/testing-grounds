import React, { useEffect, useState } from 'react';
import axios from '../../axiosConfig';

const LeagueSelection = () => {
    const [games, setGames] = useState([]);
    const [leagues, setLeagues] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedGameKey, setSelectedGameKey] = useState('');

    // Define parseLeagues function here
    const parseLeagues = (data) => {
        try {
            const leaguesData = data?.fantasy_content?.users?.[0]?.user?.[1]?.games?.[0]?.game?.[1]?.leagues;

            if (!leaguesData || leaguesData.count === 0) {
                console.warn('No leagues found for the game.');
                return [];
            }

            const leaguesArray = [];
            for (let i = 0; i < leaguesData.count; i++) {
                const league = leaguesData[i]?.league?.[0];
                if (league) {
                    leaguesArray.push({
                        league_id: league.league_id,
                        name: league.name,
                        // Add other fields as needed
                    });
                }
            }
            return leaguesArray;
        } catch (err) {
            console.error('Error parsing leagues:', err);
            return [];
        }
    };

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await axios.get('/api/games');
                const fetchedGames = response.data.games; // Adjust based on actual response structure
                console.log('Fetched Games:', fetchedGames);
                setGames(fetchedGames || []);
            } catch (err) {
                console.error('Error fetching games:', err);
                setError('Failed to load games.');
            }
        };
        fetchGames();
    }, []);

    const handleGameChange = (e) => {
        setSelectedGameKey(e.target.value);
    };

    useEffect(() => {
        if (!selectedGameKey) return;

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

    return (
        <div>
            <h2>Select a League</h2>
            <div>
                <label htmlFor="game-select">Select Sport: </label>
                <select id="game-select" value={selectedGameKey} onChange={handleGameChange}>
                    <option value="" disabled>Select a game</option>
                    {Array.isArray(games) && games.length > 0 ? (
                        games.map(game => (
                            <option key={game.game_key} value={game.game_key}>{game.name}</option>
                        ))
                    ) : (
                        <option value="" disabled>No games available</option>
                    )}
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
