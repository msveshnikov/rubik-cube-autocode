import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState({
        mode: 'light',
        highContrast: false,
        animationSpeed: 1,
        colors: {
            background: '#ffffff',
            text: '#000000',
            primary: '#646cff',
            secondary: '#61dafb',
            accent: '#888888'
        }
    });

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(JSON.parse(savedTheme));
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme((prev) => ({
                ...prev,
                mode: prefersDark ? 'dark' : 'light',
                colors: {
                    ...prev.colors,
                    background: prefersDark ? '#242424' : '#ffffff',
                    text: prefersDark ? '#ffffff' : '#000000'
                }
            }));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', JSON.stringify(theme));
        document.documentElement.setAttribute('data-theme', theme.mode);
        document.documentElement.style.setProperty('--animation-speed', `${theme.animationSpeed}`);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => ({
            ...prev,
            mode: prev.mode === 'light' ? 'dark' : 'light',
            colors: {
                ...prev.colors,
                background: prev.mode === 'light' ? '#242424' : '#ffffff',
                text: prev.mode === 'light' ? '#ffffff' : '#000000'
            }
        }));
    };

    const toggleHighContrast = () => {
        setTheme((prev) => ({
            ...prev,
            highContrast: !prev.highContrast,
            colors: {
                ...prev.colors,
                primary: prev.highContrast ? '#646cff' : '#0000ff',
                secondary: prev.highContrast ? '#61dafb' : '#ff0000',
                accent: prev.highContrast ? '#888888' : '#000000'
            }
        }));
    };

    const setAnimationSpeed = (speed) => {
        setTheme((prev) => ({
            ...prev,
            animationSpeed: speed
        }));
    };

    const value = {
        theme,
        toggleTheme,
        toggleHighContrast,
        setAnimationSpeed
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
