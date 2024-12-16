import { useState, useCallback, useEffect } from 'react';

const INITIAL_CUBE_STATE = {
    faces: {
        front: Array(9).fill('white'),
        back: Array(9).fill('yellow'),
        top: Array(9).fill('red'),
        bottom: Array(9).fill('orange'),
        left: Array(9).fill('green'),
        right: Array(9).fill('blue')
    },
    moves: [],
    currentStep: 0,
    isSolved: true,
    tutorialMode: true,
    practiceMode: false,
    history: [],
    startTime: null,
    elapsedTime: 0,
    pattern: 'classic',
    animationSpeed: 1,
    isAnimating: false,
    customPatterns: [],
    achievements: [],
    solveMethod: 'beginner',
    hapticFeedback: true,
    offlineMode: false,
    lastSyncTime: null
};

export const useCubeState = () => {
    const [state, setState] = useState(() => {
        const savedState = localStorage.getItem('cubeState');
        return savedState ? { ...INITIAL_CUBE_STATE, ...JSON.parse(savedState) } : INITIAL_CUBE_STATE;
    });

    const rotateFace = useCallback(
        (face, direction) => {
            if (state.isAnimating) return;

            setState((prev) => {
                const newFaces = { ...prev.faces };
                const faceArray = [...prev.faces[face]];
                const rotatedFace =
                    direction === 'clockwise'
                        ? [6, 3, 0, 7, 4, 1, 8, 5, 2].map((i) => faceArray[i])
                        : [2, 5, 8, 1, 4, 7, 0, 3, 6].map((i) => faceArray[i]);
                newFaces[face] = rotatedFace;

                const newState = {
                    ...prev,
                    faces: newFaces,
                    moves: [...prev.moves, { face, direction }],
                    history: [...prev.history, { faces: prev.faces, moves: prev.moves }],
                    isSolved: checkIfSolved(newFaces),
                    isAnimating: true
                };

                if (prev.hapticFeedback && window.navigator?.vibrate) {
                    window.navigator.vibrate(50);
                }

                return newState;
            });

            setTimeout(() => {
                setState((prev) => ({ ...prev, isAnimating: false }));
            }, 500 / state.animationSpeed);
        },
        [state.isAnimating, state.animationSpeed]
    );

    const applyAlgorithm = useCallback((algorithm) => {
        algorithm.split(' ').forEach((move) => {
            const direction = move.includes("'") ? 'counterclockwise' : 'clockwise';
            const face = move.charAt(0);
            rotateFace(face, direction);
        });
    }, [rotateFace]);

    const setSolveMethod = useCallback((method) => {
        setState((prev) => ({ ...prev, solveMethod: method }));
    }, []);

    const saveCustomPattern = useCallback((pattern) => {
        setState((prev) => ({
            ...prev,
            customPatterns: [...prev.customPatterns, pattern]
        }));
    }, []);

    const toggleHapticFeedback = useCallback(() => {
        setState((prev) => ({ ...prev, hapticFeedback: !prev.hapticFeedback }));
    }, []);

    const syncProgress = useCallback(async () => {
        if (!state.offlineMode) {
            setState((prev) => ({ ...prev, lastSyncTime: Date.now() }));
        }
    }, [state.offlineMode]);

    const resetCube = useCallback(() => {
        setState((prev) => ({
            ...INITIAL_CUBE_STATE,
            animationSpeed: prev.animationSpeed,
            hapticFeedback: prev.hapticFeedback,
            customPatterns: prev.customPatterns,
            achievements: prev.achievements
        }));
    }, []);

    const undoMove = useCallback(() => {
        setState((prev) => {
            if (prev.history.length === 0) return prev;
            const lastState = prev.history[prev.history.length - 1];
            return {
                ...prev,
                faces: lastState.faces,
                moves: lastState.moves,
                history: prev.history.slice(0, -1),
                isSolved: checkIfSolved(lastState.faces)
            };
        });
    }, []);

    const toggleMode = useCallback((mode) => {
        setState((prev) => ({
            ...prev,
            tutorialMode: mode === 'tutorial',
            practiceMode: mode === 'practice',
            startTime: mode === 'practice' ? Date.now() : null,
            currentStep: mode === 'tutorial' ? prev.currentStep : 0
        }));
    }, []);

    const updateTimer = useCallback(() => {
        setState((prev) => ({
            ...prev,
            elapsedTime: prev.startTime ? Date.now() - prev.startTime : 0
        }));
    }, []);

    useEffect(() => {
        let timer;
        if (state.practiceMode && !state.isSolved) {
            timer = setInterval(updateTimer, 100);
        }
        return () => clearInterval(timer);
    }, [state.practiceMode, state.isSolved, updateTimer]);

    useEffect(() => {
        localStorage.setItem('cubeState', JSON.stringify(state));
    }, [state]);

    return {
        state,
        rotateFace,
        resetCube,
        undoMove,
        toggleMode,
        updateTimer,
        applyAlgorithm,
        setSolveMethod,
        saveCustomPattern,
        toggleHapticFeedback,
        syncProgress
    };
};

const checkIfSolved = (faces) => {
    return Object.values(faces).every((face) => face.every((color) => color === face[0]));
};

export default useCubeState;