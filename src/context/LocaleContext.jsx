import { createContext, useContext, useState, useCallback } from 'react';

const LocaleContext = createContext();

const defaultLocale = 'en';
const supportedLocales = ['en', 'es', 'fr', 'de', 'zh', 'ja'];

const translations = {
    en: {
        tutorial: {
            title: 'Tutorial',
            steps: ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5', 'Step 6', 'Step 7']
        },
        controls: {
            rotate: 'Rotate',
            reset: 'Reset',
            undo: 'Undo',
            practice: 'Practice Mode',
            timer: 'Timer'
        },
        settings: {
            title: 'Settings',
            language: 'Language',
            contrast: 'High Contrast',
            speed: 'Animation Speed'
        }
    }
};

export function LocaleProvider({ children }) {
    const [locale, setLocale] = useState(() => {
        const savedLocale = localStorage.getItem('locale');
        return supportedLocales.includes(savedLocale) ? savedLocale : defaultLocale;
    });

    const changeLocale = useCallback((newLocale) => {
        if (supportedLocales.includes(newLocale)) {
            setLocale(newLocale);
            localStorage.setItem('locale', newLocale);
        }
    }, []);

    const translate = useCallback(
        (key) => {
            const keys = key.split('.');
            let translation = translations[locale];

            for (const k of keys) {
                translation = translation?.[k];
                if (!translation) break;
            }

            return translation || key;
        },
        [locale]
    );

    const value = {
        locale,
        supportedLocales,
        changeLocale,
        translate,
        t: translate
    };

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
}

export default LocaleContext;
