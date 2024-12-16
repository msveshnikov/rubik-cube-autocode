import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
// import  CubeStateProvider  from './hooks/useCubeState';
import { ThemeProvider } from './context/ThemeContext';
import { ProgressProvider } from './context/ProgressContext';
import { LocaleProvider } from './context/LocaleContext';
import App from './App';

const root = createRoot(document.getElementById('root'));

root.render(
    <Router>
        <LocaleProvider>
            <ThemeProvider>
                <ProgressProvider>
                    {/* <CubeStateProvider> */}
                    <App />
                    {/* </CubeStateProvider> */}
                </ProgressProvider>
            </ThemeProvider>
        </LocaleProvider>
    </Router>
);
