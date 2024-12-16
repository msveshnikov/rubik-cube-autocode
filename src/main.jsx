import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext';
import { ProgressProvider } from './context/ProgressContext';
import { LocaleProvider } from './context/LocaleContext';
import App from './App';

const root = createRoot(document.getElementById('root'));

root.render(
    <LocaleProvider>
        <ThemeProvider>
            <ProgressProvider>
                <App />
            </ProgressProvider>
        </ThemeProvider>
    </LocaleProvider>
);
