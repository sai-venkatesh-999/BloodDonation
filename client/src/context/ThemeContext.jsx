import React, { createContext, useState, useEffect } from 'react';

// Create the context
export const ThemeContext = createContext();

// Create the provider component
export const ThemeProvider = ({ children }) => {
    // State to hold the current theme, defaulting to 'light'
    // It tries to get the saved theme from localStorage first
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // This effect runs whenever the theme state changes
    useEffect(() => {
        // Apply the theme class to the <html> element
        const html = document.documentElement;
        if (theme === 'dark') {
            html.classList.add('is-dark');
        } else {
            html.classList.remove('is-dark');
        }
        // Save the current theme to localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Function to toggle the theme
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // Provide the theme and the toggle function to children components
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};