// src/axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: '/', // Assuming frontend and backend are on the same domain
    withCredentials: true, // Send cookies with requests
});

// Optional: Add interceptors
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        // Handle global errors, e.g., redirect to login on 401
        if (error.response && error.response.status === 401) {
            window.location.href = '/'; // Redirect to login or home page
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
