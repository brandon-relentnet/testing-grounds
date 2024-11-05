// server.js

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const crypto = require('crypto');

const app = express();

// Environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const tokenUrl = 'https://api.login.yahoo.com/oauth2/get_token';

// Create Redis client
const redisClient = redis.createClient({
    host: 'localhost', // Replace with your Redis server host
    port: 6379,        // Replace with your Redis server port
    // password: 'your_redis_password', // If Redis is secured
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

// Middleware

// Use Helmet for security headers
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: 'https://fantasy.fleetingfascinations.com', // Your frontend domain
    credentials: true
}));

// Session configuration with Redis store
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'your-strong-secret',
    resave: false,
    saveUninitialized: false, // Better to set to false
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true in production
        sameSite: 'lax',
        domain: '.fleetingfascinations.com', // Allows sharing across subdomains
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Logging middleware for debugging
app.use((req, res, next) => {
    console.log('--- Request Details ---');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Cookies:', req.headers.cookie);
    console.log('Session ID:', req.sessionID);
    console.log('Session Data:', req.session);
    next();
});

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/build')));

// Route to initiate OAuth flow
app.get('/auth/yahoo', (req, res) => {
    const state = crypto.randomBytes(16).toString('hex'); // More secure state generation
    req.session.oauthState = state;
    console.log('Generated state:', state);
    console.log('Session ID:', req.sessionID);

    const scopes = ['openid', 'fspt-r']; // Use 'fspt-w' for read/write access, 'fspt-r' for read-only
    const scopeParam = encodeURIComponent(scopes.join(' '));
    const yahooAuthUrl = `https://api.login.yahoo.com/oauth2/request_auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scopeParam}&state=${state}`;

    res.redirect(yahooAuthUrl);
});

app.get('/auth/callback', async (req, res) => {
    const authCode = req.query.code;
    const state = req.query.state;

    // Log received code and state
    console.log('--- Callback Received ---');
    console.log('Received code:', authCode);
    console.log('Received state:', state);
    console.log('Session state:', req.session.oauthState);
    console.log('Session ID:', req.sessionID);
    console.log('Full Session Object:', req.session);

    // Check for authorization code and state validity
    if (!authCode || !state || state !== req.session.oauthState) {
        console.error("Error: Authorization code or state missing or invalid.");
        return res.status(400).send("Authorization code or state missing or invalid.");
    }

    // Exchange authorization code for access token
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
        req.session.accessToken = accessToken;
        req.session.refreshToken = response.data.refresh_token;
        req.session.expiresIn = response.data.expires_in;
        req.session.tokenTimestamp = Date.now();

        console.log('Access token obtained and stored in session.');
        res.redirect('https://fantasy.fleetingfascinations.com'); // Redirect to frontend
    } catch (error) {
        console.error('Error getting access token:', error.response ? error.response.data : error.message);
        res.status(500).send('Authentication failed');
    }
});

// Middleware to refresh access tokens
app.use(async (req, res, next) => {
    if (req.session.accessToken && req.session.tokenTimestamp) {
        const currentTime = Date.now();
        const elapsed = (currentTime - req.session.tokenTimestamp) / 1000; // in seconds
        if (elapsed > req.session.expiresIn - 300) { // Refresh 5 minutes before expiry
            try {
                const response = await axios.post(tokenUrl, new URLSearchParams({
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

                req.session.accessToken = response.data.access_token;
                req.session.refreshToken = response.data.refresh_token || req.session.refreshToken;
                req.session.expiresIn = response.data.expires_in;
                req.session.tokenTimestamp = Date.now();

                console.log('Access token refreshed.');
            } catch (error) {
                console.error('Error refreshing access token:', error.response ? error.response.data : error.message);
                // Destroy the session and prompt re-authentication
                req.session.destroy(err => {
                    if (err) {
                        console.error('Error destroying session:', err);
                    }
                    return res.status(401).send('Session expired. Please re-authenticate.');
                });
            }
        }
    }
    next();
});

// Endpoint to check if user is authenticated
app.get('/api/check-auth', (req, res) => {
    console.log('Session in /api/check-auth:', req.session);
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

    // Optional: Implement token refresh logic here if not using global middleware

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

// Serve React frontend for any other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
