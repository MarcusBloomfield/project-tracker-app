import React, { useState, useEffect, useRef } from 'react'
import { uptimeManager, UptimeInfo } from '../utils/uptimeManager';
import '../css/Timer.css'

const Timer: React.FC = () => {
    const [elapsed, setElapsed] = useState<number>(0)
    const [startTime, setStartTime] = useState<Date | null>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)


    useEffect(() => {
        if (startTime) {
            intervalRef.current = setInterval(() => {
                setElapsed(Date.now() - startTime.getTime());
            }, 1000);
        } else {
            setElapsed(0);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [startTime]);


    const getUptime = (): UptimeInfo => {
        return {
            startTime: startTime ? new Date(startTime) : new Date(),
            currentUptime: uptimeManager.formatDuration(elapsed),
        };
    };

    const startTimer = () => {
        if (startTime) setStartTime(null)
        else setStartTime(new Date()); 
    };

    return (
        <div>
            <h3>Timers</h3>
            <div className='timer-container'>
                <div className='timer-text'>{startTime ? 'Work timer: '+ getUptime().currentUptime : 'Work timer: not started'}</div>

                <button className={`timer-button${startTime ? ' timer-button-running' : ''}`} onClick={startTimer}>
                   <p className='timer-button-icon'>{startTime ? '⏹' : '▶'}</p>
                </button>
            </div>
        </div>
    )
}
export default Timer; 
