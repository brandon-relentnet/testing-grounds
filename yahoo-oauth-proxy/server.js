// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Step 1: Redirect user to Yahoo's OAuth consent page
app.get('/auth/yahoo', (req, res) => {
    const yahooAuthUrl = `https://api.login.yahoo.com/oauth2/request_auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=fantasy`;
    res.redirect(yahooAuthUrl);
});

// server.js - /auth/callback
app.get('/auth/callback', async (req, res) => {
    const authCode = req.query.code;
    const tokenUrl = 'https://api.login.yahoo.com/oauth2/get_token';

    try {
        const response = await axios.post(tokenUrl, null, {
            params: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                code: authCode,
                grant_type: 'authorization_code',
            },
        });

        const accessToken = response.data.access_token;

        // Redirect to the frontend with the access token
        res.redirect(`https://fantasy.fleetingfascinations.com?token=${accessToken}`);
    } catch (error) {
        console.error('Error getting access token:', error);
        res.status(500).send('Authentication failed');
    }
});

// Additional endpoint to fetch Fantasy Sports data
app.get('/fantasy-data', async (req, res) => {
    const accessToken = req.query.token;

    try {
        const response = await axios.get('https://fantasysports.yahooapis.com/fantasy/v2/league/', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Failed to fetch data');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
