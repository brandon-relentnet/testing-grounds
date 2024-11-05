// src/components/Dropdown.js
import React, { useState, useEffect, useRef } from 'react';

function Dropdown({ options, onSelect, label, selectedValue }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleSelect = (value) => {
        onSelect(value);
        setIsOpen(false);
    };

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="w-full mx-auto mb-4 mt-2 relative" ref={dropdownRef}>
            {/* Dropdown Button with Hover and Rotating Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2 text-left bg-surface1 text-text shadow rounded flex justify-between items-center hover:bg-surface2"
            >
                <span>{label}</span>
                {/* Rotating arrow icon */}
                <svg
                    className={`w-4 h-4 text-text ml-2 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'
                        }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06 0L10 10.92l3.71-3.71a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
            </button>

            {/* Scrollable Dropdown Menu with Animation */}
            <div
                className={`absolute mt-2 w-full bg-surface2 z-10 rounded shadow-lg transition-[max-height] duration-300 ease-in-out ${isOpen ? 'max-h-48 overflow-y-auto' : 'max-h-0 overflow-hidden'
                    }`}
                style={{ maxHeight: isOpen ? '12rem' : '0' }} // 12rem = 48 units in Tailwind
            >
                {options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={`block w-full text-left px-4 py-2 cursor-pointer ${option.value === selectedValue
                            ? 'bg-accent text-surface0 font-semibold'
                            : 'text-subtext0 hover:bg-overlay0 hover:text-text'
                            }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Dropdown;
