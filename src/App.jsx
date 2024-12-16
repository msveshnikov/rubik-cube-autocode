import { useState, lazy, Suspense, useContext } from 'react';
import './App.css';
import  ThemeContext  from './context/ThemeContext';
import  LocaleContext  from './context/LocaleContext';
import  ProgressContext  from './context/ProgressContext';

const Cube = lazy(() => import('./components/Cube'));
const Tutorial = lazy(() => import('./components/Tutorial'));
const Controls = lazy(() => import('./components/Controls'));
const Timer = lazy(() => import('./components/Timer'));

function App() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { locale, setLocale } = useContext(LocaleContext);
    const { progress, updateProgress } = useContext(ProgressContext);

    const [cubeState, setCubeState] = useState({
        currentStep: progress?.currentStep || 0,
        moves: [],
        isSolved: false,
        tutorialMode: true,
        practiceMode: false,
        pattern: 'classic'
    });

    const [settings, setSettings] = useState({
        animationSpeed: 1,
        highContrast: false,
        language: locale,
        keyboardControls: true,
        screenReaderEnabled: false
    });

    const handleMove = (move) => {
        setCubeState((prev) => {
            const newState = {
                ...prev,
                moves: [...prev.moves, move]
            };
            updateProgress({ currentStep: prev.currentStep, moves: newState.moves });
            return newState;
        });
    };

    const toggleMode = (mode) => {
        setCubeState((prev) => ({
            ...prev,
            tutorialMode: mode === 'tutorial',
            practiceMode: mode === 'practice',
            currentStep: mode === 'tutorial' ? prev.currentStep : 0
        }));
    };

    const updateSettings = (newSettings) => {
        setSettings((prev) => {
            const updated = { ...prev, ...newSettings };
            if (newSettings.language) {
                setLocale(newSettings.language);
            }
            return updated;
        });
    };

    const handlePatternChange = (pattern) => {
        setCubeState((prev) => ({
            ...prev,
            pattern,
            moves: []
        }));
    };

    return (
        <div className={`app ${theme} ${settings.highContrast ? 'high-contrast' : ''}`}>
            <header className="app-header">
                <h1>Rubik's Cube Simulator & Tutor</h1>
                <nav className="app-nav">
                    <button onClick={() => toggleMode('tutorial')}>Tutorial</button>
                    <button onClick={() => toggleMode('practice')}>Practice</button>
                    <select
                        value={settings.language}
                        onChange={(e) => updateSettings({ language: e.target.value })}
                    >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                    </select>
                    <button onClick={toggleTheme}>
                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </button>
                    <button
                        onClick={() => updateSettings({ highContrast: !settings.highContrast })}
                    >
                        High Contrast
                    </button>
                </nav>
            </header>

            <main className="app-content">
                <Suspense fallback={<div>Loading...</div>}>
                    <div className="cube-container">
                        <Cube
                            onMove={handleMove}
                            settings={settings}
                            pattern={cubeState.pattern}
                            tutorialMode={cubeState.tutorialMode}
                        />
                        <Controls
                            onMove={handleMove}
                            settings={settings}
                            disabled={cubeState.isSolved}
                        />
                    </div>

                    {cubeState.tutorialMode && (
                        <Tutorial
                            currentStep={cubeState.currentStep}
                            moves={cubeState.moves}
                            settings={settings}
                        />
                    )}

                    {cubeState.practiceMode && (
                        <Timer
                            active={cubeState.practiceMode}
                            isSolved={cubeState.isSolved}
                            settings={settings}
                        />
                    )}
                </Suspense>
            </main>

            <footer className="app-footer">
                <div className="progress">
                    {cubeState.tutorialMode && (
                        <progress
                            value={cubeState.currentStep}
                            max={7}
                            aria-label="Tutorial Progress"
                        />
                    )}
                </div>
                <div className="settings">
                    <label>
                        Animation Speed:
                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={settings.animationSpeed}
                            onChange={(e) =>
                                updateSettings({ animationSpeed: parseFloat(e.target.value) })
                            }
                        />
                    </label>
                </div>
            </footer>
        </div>
    );
}

export default App;
