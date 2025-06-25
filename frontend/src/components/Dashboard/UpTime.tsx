import React, { useState, useEffect } from 'react';
import { uptimeManager, UptimeInfo } from '../../utils/uptimeManager';

const UpTime: React.FC = () => {
  const [uptime, setUptime] = useState<UptimeInfo>(uptimeManager.getUptime());

  // Update uptime every second
  useEffect(() => {
    const uptimeInterval = setInterval(() => {
      setUptime(uptimeManager.getUptime());
    }, 1000);

    return () => clearInterval(uptimeInterval);
  }, []);

return (
        <div className="uptime-section">
          <div className="uptime-card">
            <div className="uptime-details">
              Started: {uptime.startTime.toLocaleString()}
            </div>
            <div className="uptime-value">{uptime.currentUptime}</div>
          </div>
        </div>
)}

export default UpTime;
