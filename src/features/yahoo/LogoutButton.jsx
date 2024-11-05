// src/components/LogoutButton.jsx
import React from 'react';
import axios from '../../axiosConfig';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post('/api/logout');
            navigate('/'); // Redirect to homepage or login page
        } catch (error) {
            console.error('Error during logout:', error);
            alert('Failed to logout. Please try again.');
        }
    };

    return (
        <button onClick={handleLogout} style={buttonStyle}>
            Logout
        </button>
    );
};

const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
};

export default LogoutButton;
