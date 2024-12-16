import { useState, useCallback } from 'react';

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
    elapsedTime: 0
};

export const useCubeState = () => {
    const [state, setState] = useState(INITIAL_CUBE_STATE);

    const rotateFace = useCallback((face, direction) => {
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
                isSolved: checkIfSolved(newFaces)
            };
        });
    }, []);

    const applyMove = useCallback((move) => {
        setState((prev) => ({
            ...prev,
            moves: [...prev.moves, move],
            currentStep: prev.tutorialMode ? prev.currentStep + 1 : prev.currentStep,
            history: [...prev.history, { faces: prev.faces, moves: prev.moves }]
        }));
    }, []);

    const resetCube = useCallback(() => {
        setState(INITIAL_CUBE_STATE);
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
            startTime: mode === 'practice' ? Date.now() : null
        }));
    }, []);

    const updateTimer = useCallback(() => {
        setState((prev) => ({
            ...prev,
            elapsedTime: prev.startTime ? Date.now() - prev.startTime : 0
        }));
    }, []);

    return {
        state,
        rotateFace,
        applyMove,
        resetCube,
        undoMove,
        toggleMode,
        updateTimer
    };
};

const checkIfSolved = (faces) => {
    return Object.values(faces).every((face) => face.every((color) => color === face[0]));
};

export default useCubeState;
