// src/pages/About.jsx
import React from 'react';
import LoginButton from '../features/yahoo/LoginButton';

function About() {
    return (
        <div class="container mx-auto p-4">
            <div class="flex justify-center pt-10 items-start h-screen">
                <div class="text-center">
                    <h1>Welcome to Fantasy Manager</h1>
                    <LoginButton />
                </div>
            </div>
        </div>

    );
}

export default About;
