// src/features/counter/ThemeDropdown.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from './themeSlice';
import Dropdown from '../../components/Dropdown';

const themeOptions = [
    { value: 'mocha', label: 'Mocha' },
    { value: 'macchiato', label: 'Macchiato' },
    { value: 'frappe', label: 'Frappe' },
    { value: 'latte', label: 'Latte' },
];

function ThemeDropdown() {
    const dispatch = useDispatch();
    const currentTheme = useSelector((state) => state.theme);

    const handleThemeSelect = (theme) => {
        dispatch(setTheme(theme));
    };

    return (
        <Dropdown
            options={themeOptions}
            onSelect={handleThemeSelect}
            label={themeOptions.find((option) => option.value === currentTheme)?.label || 'Select a Theme'}
            selectedValue={currentTheme}
        />
    );
}

export default ThemeDropdown;
