// src/pages/Home.jsx
import React from 'react';
import ThemeDropdown from '../features/theme/ThemeDropdown';
import AccentDropdown from '../features/accent/AccentDropdown';
import FontFamilyDropdown from '../features/font-family/FontFamilyDropdown';

function Settings() {
    return (
        <div className="container mx-auto p-4">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl text-text font-bold m-8">Settings</h1>

                <h2 className='text-2xl text-subtext1 font-semibold m-4 text-left'>Appearance</h2>
                {/* Centered grid with larger width */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface0 rounded shadow">
                    <div className="p-4 text-left">
                        <label className='text-subtext1 ml-1 font-semibold block'>Theme:</label>
                        <ThemeDropdown />
                        <label className='text-subtext1 ml-1 font-semibold block'>Accent:</label>
                        <AccentDropdown />
                    </div>
                    <div className="p-4 text-left">
                        <label className='text-subtext1 ml-1 font-semibold block'>Font Family:</label>
                        <FontFamilyDropdown />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
