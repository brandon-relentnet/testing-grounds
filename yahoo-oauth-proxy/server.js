// server.js

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const RedisStore = require('connect-redis').default; // For connect-redis v4.x
const { createClient } = require('redis'); // Redis v4.x
const crypto = require('crypto');

const app = express();

// Environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-strong-secret';
const tokenUrl = 'https://api.login.yahoo.com/oauth2/get_token';
const PORT = process.env.PORT || 5000;

// Create Redis client with IPv4
const redisClient = createClient({
    socket: {
        host: '127.0.0.1', // Use IPv4 loopback address to avoid IPv6 issues
        port: process.env.REDIS_PORT || 6379,
        // password: process.env.REDIS_PASSWORD, // Uncomment if Redis requires a password
    }
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

// Connect to Redis and start the server
(async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');

        // Session configuration with Redis store
        app.use(session({
            name: 'ff-session-id', // Custom session cookie name to prevent conflicts
            store: new RedisStore({ client: redisClient }),
            secret: SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: process.env.NODE_ENV === 'production', // true in production
                sameSite: 'lax',
                domain: '.fleetingfascinations.com', // Allows sharing across subdomains
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
            }
        }));

        // Middleware

        // Use Helmet for security headers
        app.use(helmet());

        // CORS configuration
        app.use(cors({
            origin: 'https://fantasy.fleetingfascinations.com', // Your frontend domain
            credentials: true
        }));

        // Enhanced Logging with Morgan
        const morgan = require('morgan');
        app.use(morgan('combined')); // or 'dev' for simpler output

        // Existing custom logging middleware
        app.use((req, res, next) => {
            console.log('--- Request Details ---');
            console.log('URL:', req.url);
            console.log('Method:', req.method);
            console.log('Cookies:', req.headers.cookie);
            console.log('Session ID:', req.sessionID);
            console.log('Session Data:', req.session);
            next();
        });

        // Middleware to parse JSON bodies
        app.use(express.json());

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
            const promptParam = req.query.prompt ? `&prompt=${req.query.prompt}` : '';
            const yahooAuthUrl = `https://api.login.yahoo.com/oauth2/request_auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scopeParam}&state=${state}${promptParam}`;

            res.redirect(yahooAuthUrl);
        });

        // OAuth callback route
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

        // Logout Route
        app.post('/api/logout', (req, res) => {
            console.log('--- /api/logout Request ---');
            console.log('Session ID before logout:', req.sessionID);

            req.session.destroy(err => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).send('Failed to logout. Please try again.');
                }
                // Clear the session cookie
                res.clearCookie('ff-session-id', {
                    domain: '.fleetingfascinations.com',
                    path: '/',
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                });
                console.log('Session destroyed successfully.');
                res.status(200).send('Logged out successfully.');
            });
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

        // Endpoint to fetch games
        app.get('/api/games', async (req, res) => {
            console.log('--- /api/games Request ---');
            const accessToken = req.session.accessToken;

            if (!accessToken) {
                console.warn('No accessToken found in session.');
                return res.status(401).send('User not authenticated');
            }

            try {
                const yahooApiUrl = 'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games?format=json';
                console.log(`Fetching games from Yahoo API: ${yahooApiUrl}`);

                const response = await axios.get(yahooApiUrl, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                console.log('Successfully fetched games from Yahoo API.');

                // Use the implemented parseGames function
                const games = parseGames(response.data);
                console.log('Games being sent to frontend:', games);
                res.json({ games });
            } catch (error) {
                console.error('Error fetching games:', error.response ? error.response.data : error.message);
                res.status(500).send('Failed to fetch games');
            }
        });

        // Implement the parseGames function
        const parseGames = (data) => {
            const games = [];
            const gamesData = data.fantasy_content?.users?.[0]?.user?.[1]?.games;

            if (gamesData && gamesData.count > 0) {
                for (let i = 0; i < gamesData.count; i++) {
                    const game = gamesData[i]?.game;
                    if (game) {
                        games.push({
                            game_key: game[0]?.game_key,
                            name: game[0]?.name,
                            code: game[0]?.code,
                            season: game[0]?.season,
                            // Add other fields as needed
                        });
                    }
                }
            } else {
                console.warn('No games data found in the response.');
            }

            return games;
        };

        // Endpoint to fetch fantasy data
        app.get('/api/fantasy-data', async (req, res) => {
            console.log('--- /api/fantasy-data Request ---');
            console.log('Session ID:', req.sessionID);
            console.log('Session Data:', req.session);

            const accessToken = req.session.accessToken;

            if (!accessToken) {
                console.warn('No accessToken found in session.');
                return res.status(401).send('User not authenticated');
            }

            const gameKeys = req.query.game_keys;
            if (!gameKeys) {
                console.warn('No game_keys parameter provided.');
                return res.status(400).send('No game_keys parameter provided.');
            }

            try {
                // Include the gameKeys in the API request
                const response = await axios.get(`https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=${gameKeys}/leagues?format=json`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                console.log('Successfully fetched fantasy data from Yahoo API.');
                res.json(response.data);
            } catch (error) {
                console.error('Error fetching fantasy data:', error.response ? error.response.data : error.message);
                res.status(500).send('Failed to fetch fantasy data');
            }
        });

        // Serve React frontend for any other routes
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
        });

        // Start the server
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error('Error initializing server:', err);
        process.exit(1);
    }
})();
