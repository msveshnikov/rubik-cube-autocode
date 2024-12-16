import { useState, useEffect, useCallback, memo } from 'react';
import PropTypes from 'prop-types';

const Timer = memo(({ active }) => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [bestTime, setBestTime] = useState(() => {
        const saved = localStorage.getItem('bestTime');
        return saved ? parseInt(saved, 10) : null;
    });

    const formatTime = useCallback((ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const centiseconds = Math.floor((ms % 1000) / 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
    }, []);

    useEffect(() => {
        let interval;
        if (isRunning) {
            const startTime = Date.now() - time;
            interval = setInterval(() => {
                setTime(Date.now() - startTime);
            }, 10);
        }
        return () => clearInterval(interval);
    }, [isRunning, time]);

    useEffect(() => {
        if (active) {
            setIsRunning(true);
        } else {
            setIsRunning(false);
            if (time > 0 && (!bestTime || time < bestTime)) {
                setBestTime(time);
                localStorage.setItem('bestTime', time.toString());
            }
            setTime(0);
        }
    }, [active, time, bestTime]);

    const handleStartStop = () => {
        setIsRunning(!isRunning);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTime(0);
    };

    return (
        <div className="timer">
            <div className="timer-display">
                <div className="current-time">{formatTime(time)}</div>
                {bestTime && <div className="best-time">Best: {formatTime(bestTime)}</div>}
            </div>
            <div className="timer-controls">
                <button
                    onClick={handleStartStop}
                    className={`timer-button ${isRunning ? 'stop' : 'start'}`}
                >
                    {isRunning ? 'Stop' : 'Start'}
                </button>
                <button onClick={handleReset} className="timer-button reset" disabled={isRunning}>
                    Reset
                </button>
            </div>
        </div>
    );
});

Timer.propTypes = {
    active: PropTypes.bool.isRequired
};

Timer.displayName = 'Timer';

export default Timer;
