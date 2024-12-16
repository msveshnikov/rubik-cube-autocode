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
    isAnimating: false
};

export const useCubeState = () => {
    const [state, setState] = useState(INITIAL_CUBE_STATE);

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

                return {
                    ...prev,
                    faces: newFaces,
                    moves: [...prev.moves, { face, direction }],
                    history: [...prev.history, { faces: prev.faces, moves: prev.moves }],
                    isSolved: checkIfSolved(newFaces),
                    isAnimating: true
                };
            });

            setTimeout(() => {
                setState((prev) => ({ ...prev, isAnimating: false }));
            }, 500 / state.animationSpeed);
        },
        [state.isAnimating, state.animationSpeed]
    );

    const applyMove = useCallback((move) => {
        setState((prev) => ({
            ...prev,
            moves: [...prev.moves, move],
            currentStep: prev.tutorialMode ? prev.currentStep + 1 : prev.currentStep,
            history: [...prev.history, { faces: prev.faces, moves: prev.moves }]
        }));
    }, []);

    const resetCube = useCallback(() => {
        setState((prev) => ({
            ...INITIAL_CUBE_STATE,
            animationSpeed: prev.animationSpeed
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

    const setPattern = useCallback((pattern) => {
        setState((prev) => ({ ...prev, pattern }));
    }, []);

    const setAnimationSpeed = useCallback((speed) => {
        setState((prev) => ({ ...prev, animationSpeed: speed }));
    }, []);

    useEffect(() => {
        let timer;
        if (state.practiceMode && !state.isSolved) {
            timer = setInterval(updateTimer, 100);
        }
        return () => clearInterval(timer);
    }, [state.practiceMode, state.isSolved, updateTimer]);

    return {
        state,
        rotateFace,
        applyMove,
        resetCube,
        undoMove,
        toggleMode,
        updateTimer,
        setPattern,
        setAnimationSpeed
    };
};

const checkIfSolved = (faces) => {
    return Object.values(faces).every((face) => face.every((color) => color === face[0]));
};

export default useCubeState;
