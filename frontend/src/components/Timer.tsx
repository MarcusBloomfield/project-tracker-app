import React, { useState, useEffect, useRef } from 'react'
import { uptimeManager } from '../utils/uptimeManager';
import { workTimeManager } from '../utils/workTimeManager';
import WorkTimeGraph from './WorkTimeGraph';
import '../css/Timer.css'

const Timer: React.FC = () => {
    const [elapsed, setElapsed] = useState(0)
    const [startTime, setStartTime] = useState<Date | null>(null)
    const [isPaused, setIsPaused] = useState(false)
    const [totalPausedTime, setTotalPausedTime] = useState(0)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (startTime && !isPaused) {
            intervalRef.current = setInterval(() => {
                const currentTime = Date.now();
                const baseElapsed = currentTime - startTime.getTime();
                setElapsed(baseElapsed - totalPausedTime);
            }, 1000);
        } else if (!startTime) {
            setElapsed(0);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [startTime, isPaused, totalPausedTime]);

    const formatTime = () => uptimeManager.formatDuration(elapsed);

    const startTimer = () => {
        setStartTime(new Date());
        setIsPaused(false);
        setTotalPausedTime(0);
        setElapsed(0);
    };

    const pauseTimer = () => {
        setIsPaused(true);
    };

    const resumeTimer = () => {
        const pauseDuration = Date.now() - startTime!.getTime() - elapsed;
        setTotalPausedTime(totalPausedTime + pauseDuration);
        setIsPaused(false);
    };

    const stopTimer = async () => {
        if (startTime && elapsed > 0) {
            // Save the work session
            try {
                const endTime = new Date();
                const sessionData = {
                    startTime: startTime,
                    endTime: endTime,
                    duration: elapsed // actual work time excluding pauses
                };
                
                await workTimeManager.saveWorkSession(sessionData);
                console.log('Work session saved successfully:', workTimeManager.formatDuration(elapsed));
            } catch (error) {
                console.error('Failed to save work session:', error);
            }
        }
        
        setStartTime(null);
        setIsPaused(false);
        setTotalPausedTime(0);
        setElapsed(0);
    };

    const getStatus = () => {
        if (!startTime) return 'Work timer: not started';
        if (isPaused) return `Work timer: paused - ${formatTime()}`;
        return `Work timer: ${formatTime()}`;
    };

    return (
        <div className='timer-container'>
            <div className='timer-header'>
                <div className='timer-text'>{getStatus()}</div>
                <div className='timer-controls'>
                    {!startTime ? (
                        <button className='timer-button' onClick={startTimer}>▶</button>
                    ) : (
                        <>
                            <button 
                                className={`timer-button ${isPaused ? 'timer-button-paused' : 'timer-button-running'}`} 
                                onClick={isPaused ? resumeTimer : pauseTimer}
                            >
                                {isPaused ? '▶' : '⏸'}
                            </button>
                            <button className='timer-button timer-button-stop' onClick={stopTimer}>⏹</button>
                        </>
                    )}
                </div>
            </div>
            <div className='timer-work-time-section'>
                <WorkTimeGraph days={30} />
            </div>
        </div>
    )
}

export default Timer; 
