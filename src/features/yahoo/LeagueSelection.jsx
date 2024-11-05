// LeagueSelection.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LeagueSelection = () => {
    const [leagues, setLeagues] = useState([]);

    useEffect(() => {
        const fetchLeagues = async () => {
            try {
                const response = await axios.get('/api/fantasy-data', { withCredentials: true });
                // Parse the nested response from Yahoo API
                const fantasyContent = response.data.fantasy_content;
                const users = fantasyContent.users;
                const user = users['0'].user;
                const games = user[1].games;
                const game = games['0'].game;
                const leaguesObj = game[1].leagues;
                const leaguesCount = leaguesObj.count;

                const leaguesList = [];

                for (let i = 0; i < leaguesCount; i++) {
                    const league = leaguesObj[i].league[0];
                    leaguesList.push(league);
                }

                setLeagues(leaguesList);
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
