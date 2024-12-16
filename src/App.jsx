import { useState, lazy, Suspense, useContext, useEffect } from 'react';
import './App.css';
import ThemeContext from './context/ThemeContext';
import LocaleContext from './context/LocaleContext';
import ProgressContext from './context/ProgressContext';
import useCubeState from './hooks/useCubeState';

const Cube = lazy(() => import('./components/Cube'));
const Tutorial = lazy(() => import('./components/Tutorial'));
const Controls = lazy(() => import('./components/Controls'));
const Timer = lazy(() => import('./components/Timer'));

function App() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { locale, setLocale } = useContext(LocaleContext);
    const { progress, updateProgress } = useContext(ProgressContext);
    const {
        state: cubeState,
        rotateFace,
        applyMove,
        resetCube,
        undoMove,
        toggleMode,
        updateTimer
    } = useCubeState();

    const [settings, setSettings] = useState({
        animationSpeed: 1,
        highContrast: false,
        language: locale,
        keyboardControls: true,
        screenReaderEnabled: false,
        hapticFeedback: true,
        colorBlindMode: false,
        autoRotate: false,
        showHints: true
    });

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!settings.keyboardControls) return;
            const moves = {
                ArrowUp: 'U',
                ArrowDown: 'D',
                ArrowLeft: 'L',
                ArrowRight: 'R',
                KeyF: 'F',
                KeyB: 'B'
            };
            if (moves[e.code]) {
                handleMove(moves[e.code]);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings.keyboardControls]);

    useEffect(() => {
        if (cubeState.practiceMode) {
            const timer = setInterval(updateTimer, 100);
            return () => clearInterval(timer);
        }
    }, [cubeState.practiceMode, updateTimer]);

    const handleMove = (move) => {
        if (settings.hapticFeedback && navigator.vibrate) {
            navigator.vibrate(50);
        }
        rotateFace(move, 'clockwise');
        applyMove(move);
    };

    const updateSettings = (newSettings) => {
        setSettings((prev) => {
            const updated = { ...prev, ...newSettings };
            if (newSettings.language) {
                setLocale(newSettings.language);
            }
            localStorage.setItem('cubeSettings', JSON.stringify(updated));
            return updated;
        });
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Rubik's Cube Progress",
                    text: `I've completed ${progress.currentStep} steps!`,
                    url: window.location.href
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        }
    };

    return (
        <div
            className={`app ${theme} ${settings.highContrast ? 'high-contrast' : ''} ${settings.colorBlindMode ? 'color-blind' : ''}`}
        >
            <header className="app-header">
                <h1>Rubik&apos;s Cube Simulator & Tutor</h1>
                <nav className="app-nav">
                    <button
                        onClick={() => toggleMode('tutorial')}
                        aria-pressed={cubeState.tutorialMode}
                    >
                        Tutorial
                    </button>
                    <button
                        onClick={() => toggleMode('practice')}
                        aria-pressed={cubeState.practiceMode}
                    >
                        Practice
                    </button>
                    <select
                        value={settings.language}
                        onChange={(e) => updateSettings({ language: e.target.value })}
                        aria-label="Select language"
                    >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="ja">日本語</option>
                    </select>
                    <button onClick={toggleTheme} aria-label="Toggle theme">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    <button
                        onClick={() => updateSettings({ highContrast: !settings.highContrast })}
                        aria-label="Toggle high contrast"
                    >
                        HC
                    </button>
                    <button onClick={handleShare} aria-label="Share progress">
                        Share
                    </button>
                </nav>
            </header>

            <main className="app-content">
                <Suspense
                    fallback={
                        <div className="loading" role="status">
                            Loading...
                        </div>
                    }
                >
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
                            onUndo={undoMove}
                            onReset={resetCube}
                        />
                    </div>

                    {cubeState.tutorialMode && (
                        <Tutorial
                            currentStep={cubeState.currentStep}
                            moves={cubeState.moves}
                            settings={settings}
                            onComplete={() => updateProgress({ completed: true })}
                        />
                    )}

                    {cubeState.practiceMode && (
                        <Timer
                            active={cubeState.practiceMode}
                            isSolved={cubeState.isSolved}
                            settings={settings}
                            elapsedTime={cubeState.elapsedTime}
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
                            aria-label="Animation speed"
                        />
                    </label>
                    <div className="accessibility-options">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.keyboardControls}
                                onChange={(e) =>
                                    updateSettings({ keyboardControls: e.target.checked })
                                }
                            />
                            Keyboard Controls
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.colorBlindMode}
                                onChange={(e) =>
                                    updateSettings({ colorBlindMode: e.target.checked })
                                }
                            />
                            Color Blind Mode
                        </label>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
