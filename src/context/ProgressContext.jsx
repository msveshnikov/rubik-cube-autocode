import { createContext, useState, useContext, useEffect } from 'react';

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
    const [progress, setProgress] = useState({
        completedSteps: [],
        currentStep: 0,
        totalMoves: 0,
        bestTimes: [],
        achievements: [],
        lastPractice: null,
        tutorialCompleted: false
    });

    useEffect(() => {
        const savedProgress = localStorage.getItem('cubeProgress');
        if (savedProgress) {
            setProgress(JSON.parse(savedProgress));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cubeProgress', JSON.stringify(progress));
    }, [progress]);

    const updateProgress = (newData) => {
        setProgress((prev) => ({ ...prev, ...newData }));
    };

    const completeStep = (stepNumber) => {
        setProgress((prev) => ({
            ...prev,
            completedSteps: [...new Set([...prev.completedSteps, stepNumber])],
            currentStep: Math.max(prev.currentStep, stepNumber + 1)
        }));
    };

    const recordTime = (time) => {
        setProgress((prev) => ({
            ...prev,
            bestTimes: [...prev.bestTimes, time].sort((a, b) => a - b).slice(0, 5),
            lastPractice: new Date().toISOString()
        }));
    };

    const unlockAchievement = (achievement) => {
        setProgress((prev) => ({
            ...prev,
            achievements: [...new Set([...prev.achievements, achievement])]
        }));
    };

    const resetProgress = () => {
        setProgress({
            completedSteps: [],
            currentStep: 0,
            totalMoves: 0,
            bestTimes: [],
            achievements: [],
            lastPractice: null,
            tutorialCompleted: false
        });
        localStorage.removeItem('cubeProgress');
    };

    return (
        <ProgressContext.Provider
            value={{
                progress,
                updateProgress,
                completeStep,
                recordTime,
                unlockAchievement,
                resetProgress
            }}
        >
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgress = () => {
    const context = useContext(ProgressContext);
    if (!context) {
        throw new Error('useProgress must be used within a ProgressProvider');
    }
    return context;
};

export default ProgressContext;
