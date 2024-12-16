import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useProgress } from '../context/ProgressContext';
import { useLocale } from '../context/LocaleContext';

const tutorialSteps = [
    {
        id: 0,
        title: 'Welcome',
        description: "Learn to solve the Rubik's cube in 7 easy steps",
        moves: []
    },
    {
        id: 1,
        title: 'White Cross',
        description: 'Create a white cross on the first face',
        moves: ['F', 'R', 'U', "R'", "U'", "F'"]
    },
    {
        id: 2,
        title: 'White Corners',
        description: 'Place the white corners in correct positions',
        moves: ['R', 'U', "R'", "U'"]
    },
    {
        id: 3,
        title: 'Middle Layer',
        description: 'Solve the middle layer edges',
        moves: ['U', 'R', "U'", "R'", "U'", "F'", 'U', 'F']
    },
    {
        id: 4,
        title: 'Yellow Cross',
        description: 'Create a yellow cross on the top face',
        moves: ['F', 'R', 'U', "R'", "U'", "F'"]
    },
    {
        id: 5,
        title: 'Yellow Edges',
        description: 'Position the yellow edges correctly',
        moves: ['R', 'U', "R'", 'U', 'R', 'U2', "R'"]
    },
    {
        id: 6,
        title: 'Yellow Corners',
        description: 'Position and orient the yellow corners',
        moves: ['R', "U'", "L'", 'U', "R'", "U'", 'L']
    },
    {
        id: 7,
        title: 'Congratulations!',
        description: "You've solved the Rubik's cube!",
        moves: []
    }
];

const Tutorial = ({ currentStep, moves }) => {
    const { updateProgress } = useProgress();
    const { t } = useLocale();
    const [validationState, setValidationState] = useState({
        isValid: true,
        message: ''
    });

    const validateMoves = useCallback((currentMoves, expectedMoves) => {
        if (!expectedMoves.length) return true;
        const lastMoves = currentMoves.slice(-expectedMoves.length);
        return JSON.stringify(lastMoves) === JSON.stringify(expectedMoves);
    }, []);

    useEffect(() => {
        const currentStepMoves = tutorialSteps[currentStep]?.moves || [];
        const isValid = validateMoves(moves, currentStepMoves);

        setValidationState({
            isValid,
            message: isValid ? 'Correct!' : 'Try again'
        });

        if (isValid && currentStepMoves.length > 0) {
            updateProgress(currentStep);
        }
    }, [moves, currentStep, validateMoves, updateProgress]);

    const currentTutorial = tutorialSteps[currentStep];

    if (!currentTutorial) return null;

    return (
        <div className="tutorial-container">
            <h2>{t(currentTutorial.title)}</h2>
            <p>{t(currentTutorial.description)}</p>

            {currentTutorial.moves.length > 0 && (
                <div className="moves-display">
                    <h3>{t('Required Moves')}:</h3>
                    <div className="moves-sequence">
                        {currentTutorial.moves.map((move, index) => (
                            <span key={index} className="move">
                                {move}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className={`validation-message ${validationState.isValid ? 'valid' : 'invalid'}`}>
                {validationState.message}
            </div>

            {currentStep < tutorialSteps.length - 1 && (
                <div className="progress-indicator">
                    {t('Step')} {currentStep + 1} {t('of')} {tutorialSteps.length - 1}
                </div>
            )}
        </div>
    );
};

Tutorial.propTypes = {
    currentStep: PropTypes.number.isRequired,
    moves: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default Tutorial;
