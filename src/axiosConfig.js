// src/axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://fantasy.fleetingfascinations.com', // Your backend URL
    withCredentials: true, // Send cookies with requests
});

export default axiosInstance;
