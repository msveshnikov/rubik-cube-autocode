import { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
// import '../styles/modules/Controls.module.css';

const Controls = ({ onMove }) => {
    const [rotationAxis, setRotationAxis] = useState('y');
    const [direction, setDirection] = useState(1);
    const [keyboardEnabled, setKeyboardEnabled] = useState(true);

    const moves = {
        F: { axis: 'z', layer: 0, direction: 1 },
        B: { axis: 'z', layer: 2, direction: -1 },
        R: { axis: 'x', layer: 2, direction: 1 },
        L: { axis: 'x', layer: 0, direction: -1 },
        U: { axis: 'y', layer: 2, direction: 1 },
        D: { axis: 'y', layer: 0, direction: -1 }
    };

    const handleMove = useCallback(
        (moveNotation) => {
            const move = moves[moveNotation];
            if (move) {
                onMove({
                    ...move,
                    notation: moveNotation
                });
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [onMove]
    );

    const handleKeyDown = useCallback(
        (e) => {
            if (!keyboardEnabled) return;

            const keyMoves = {
                KeyF: 'F',
                KeyB: 'B',
                KeyR: 'R',
                KeyL: 'L',
                KeyU: 'U',
                KeyD: 'D'
            };

            const moveNotation = keyMoves[e.code];
            if (moveNotation) {
                handleMove(moveNotation);
            }
        },
        [handleMove, keyboardEnabled]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const handleAxisChange = (axis) => {
        setRotationAxis(axis);
    };

    const handleDirectionChange = (dir) => {
        setDirection(dir);
    };

    const handleRotate = () => {
        onMove({
            axis: rotationAxis,
            direction: direction,
            notation: `${rotationAxis.toUpperCase()}${direction > 0 ? '' : "'"}`
        });
    };

    return (
        <div className="controls">
            <div className="move-buttons">
                <button onClick={() => handleMove('F')}>F</button>
                <button onClick={() => handleMove('B')}>B</button>
                <button onClick={() => handleMove('R')}>R</button>
                <button onClick={() => handleMove('L')}>L</button>
                <button onClick={() => handleMove('U')}>U</button>
                <button onClick={() => handleMove('D')}>D</button>
            </div>

            <div className="rotation-controls">
                <div className="axis-buttons">
                    <button
                        className={rotationAxis === 'x' ? 'active' : ''}
                        onClick={() => handleAxisChange('x')}
                    >
                        X
                    </button>
                    <button
                        className={rotationAxis === 'y' ? 'active' : ''}
                        onClick={() => handleAxisChange('y')}
                    >
                        Y
                    </button>
                    <button
                        className={rotationAxis === 'z' ? 'active' : ''}
                        onClick={() => handleAxisChange('z')}
                    >
                        Z
                    </button>
                </div>

                <div className="direction-buttons">
                    <button
                        className={direction === 1 ? 'active' : ''}
                        onClick={() => handleDirectionChange(1)}
                    >
                        Clockwise
                    </button>
                    <button
                        className={direction === -1 ? 'active' : ''}
                        onClick={() => handleDirectionChange(-1)}
                    >
                        Counter-clockwise
                    </button>
                </div>

                <button className="rotate-button" onClick={handleRotate}>
                    Rotate
                </button>
            </div>

            <div className="settings">
                <label>
                    <input
                        type="checkbox"
                        checked={keyboardEnabled}
                        onChange={(e) => setKeyboardEnabled(e.target.checked)}
                    />
                    Enable Keyboard Controls
                </label>
            </div>
        </div>
    );
};

Controls.propTypes = {
    onMove: PropTypes.func.isRequired
};

export default Controls;
