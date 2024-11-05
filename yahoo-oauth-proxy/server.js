// server.js

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const session = require('express-session');
const cors = require('cors');

const app = express();

// Environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const tokenUrl = 'https://api.login.yahoo.com/oauth2/get_token';

// Middleware
app.use(cors({
    origin: 'https://fantasy.fleetingfascinations.com', // Replace with your frontend domain
    credentials: true
}));

app.use(session({
    secret: 'your_secret_key', // Replace with your own secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Route to initiate OAuth flow
app.get('/auth/yahoo', (req, res) => {
    const state = Math.random().toString(36).substring(2); // Generate a random state
    req.session.oauthState = state; // Store state in session to validate later
    const yahooAuthUrl = `https://api.login.yahoo.com/oauth2/request_auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=fantasy&state=${state}`;
    res.redirect(yahooAuthUrl);
});

// Callback route after user authorizes
app.get('/auth/callback', async (req, res) => {
    const authCode = req.query.code;
    const state = req.query.state;

    if (!authCode || !state || state !== req.session.oauthState) {
        return res.status(400).send("Authorization code or state missing or invalid.");
    }

    try {
        const response = await axios.post(tokenUrl, new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            code: authCode,
            grant_type: 'authorization_code',
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const accessToken = response.data.access_token;
        // Store tokens and expiration info in session
        req.session.accessToken = accessToken;
        req.session.refreshToken = response.data.refresh_token;
        req.session.expiresIn = response.data.expires_in; // Token validity in seconds
        req.session.tokenTimestamp = Date.now();

        // Redirect back to your frontend
        res.redirect(`https://fantasy.fleetingfascinations.com`);
    } catch (error) {
        console.error('Error getting access token:', error.response ? error.response.data : error.message);
        res.status(500).send('Authentication failed');
    }
});

// Endpoint to check if user is authenticated
app.get('/api/check-auth', (req, res) => {
    if (req.session.accessToken) {
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

// Endpoint to fetch fantasy data
app.get('/api/fantasy-data', async (req, res) => {
    let accessToken = req.session.accessToken;

    if (!accessToken) {
        return res.status(401).send('User not authenticated');
    }

    // Optionally refresh the access token if it's about to expire
    const tokenAge = (Date.now() - req.session.tokenTimestamp) / 1000; // Age in seconds
    if (tokenAge > req.session.expiresIn - 60) { // Refresh if less than 1 minute left
        try {
            const refreshResponse = await axios.post(tokenUrl, new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                refresh_token: req.session.refreshToken,
                grant_type: 'refresh_token',
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            accessToken = refreshResponse.data.access_token;
            req.session.accessToken = accessToken;
            req.session.refreshToken = refreshResponse.data.refresh_token;
            req.session.expiresIn = refreshResponse.data.expires_in;
            req.session.tokenTimestamp = Date.now();
        } catch (error) {
            console.error('Error refreshing access token:', error.response ? error.response.data : error.message);
            return res.status(500).send('Failed to refresh access token');
        }
    }

    try {
        const response = await axios.get('https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues?format=json', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error.response ? error.response.data : error.message);
        res.status(500).send('Failed to fetch data');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
