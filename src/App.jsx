import { useState, lazy, Suspense } from 'react';
import './App.css';

const Cube = lazy(() => import('./components/Cube'));
const Tutorial = lazy(() => import('./components/Tutorial'));
const Controls = lazy(() => import('./components/Controls'));
const Timer = lazy(() => import('./components/Timer'));

function App() {
    const [cubeState, setCubeState] = useState({
        currentStep: 0,
        moves: [],
        isSolved: false,
        tutorialMode: true,
        practiceMode: false
    });

    const [settings, setSettings] = useState({
        animationSpeed: 1,
        highContrast: false,
        language: 'en'
    });

    const handleMove = (move) => {
        setCubeState((prev) => ({
            ...prev,
            moves: [...prev.moves, move]
        }));
    };

    const toggleMode = (mode) => {
        setCubeState((prev) => ({
            ...prev,
            tutorialMode: mode === 'tutorial',
            practiceMode: mode === 'practice'
        }));
    };

    const updateSettings = (newSettings) => {
        setSettings((prev) => ({
            ...prev,
            ...newSettings
        }));
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>Rubik's Cube Simulator & Tutor</h1>
                <nav>
                    <button onClick={() => toggleMode('tutorial')}>Tutorial</button>
                    <button onClick={() => toggleMode('practice')}>Practice</button>
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
                        <Cube onMove={handleMove} settings={settings} />
                        <Controls onMove={handleMove} />
                    </div>

                    {cubeState.tutorialMode && (
                        <Tutorial currentStep={cubeState.currentStep} moves={cubeState.moves} />
                    )}

                    {cubeState.practiceMode && <Timer active={cubeState.practiceMode} />}
                </Suspense>
            </main>

            <footer className="app-footer">
                <div className="progress">
                    {cubeState.tutorialMode && <progress value={cubeState.currentStep} max={7} />}
                </div>
            </footer>
        </div>
    );
}

export default App;
