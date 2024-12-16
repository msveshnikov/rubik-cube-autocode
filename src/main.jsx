import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { CubeStateProvider } from './hooks/useCubeState';
import { ThemeProvider } from './context/ThemeContext';
import { ProgressProvider } from './context/ProgressContext';
import { LocaleProvider } from './context/LocaleContext';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root'));

root.render(
    <StrictMode>
        <ErrorBoundary>
            <Router>
                <LocaleProvider>
                    <ThemeProvider>
                        <ProgressProvider>
                            <CubeStateProvider>
                                <App />
                            </CubeStateProvider>
                        </ProgressProvider>
                    </ThemeProvider>
                </LocaleProvider>
            </Router>
        </ErrorBoundary>
    </StrictMode>
);
