export interface UptimeInfo {
  startTime: Date;
  currentUptime: string;
}

class UptimeManager {
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
  }

  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;

    const parts: string[] = [];

    if (days > 0) {
      parts.push(`${days}d`);
    }
    if (remainingHours > 0 || days > 0) {
      parts.push(`${remainingHours}h`);
    }
    if (remainingMinutes > 0 || remainingHours > 0 || days > 0) {
      parts.push(`${remainingMinutes}m`);
    }
    parts.push(`${remainingSeconds}s`);

    return parts.join(' ');
  }

  getUptime(): UptimeInfo {
    const now = new Date();
    const uptime = now.getTime() - this.startTime.getTime();
    
    return {
      startTime: this.startTime,
      currentUptime: this.formatDuration(uptime)
    };
  }
}

export const uptimeManager = new UptimeManager(); 