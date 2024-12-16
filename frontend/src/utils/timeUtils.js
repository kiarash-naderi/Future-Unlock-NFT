const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;

const getUnlockTimestamp = (days, hours, minutes) => {
    // Parse inputs and ensure they're non-negative
    const d = Math.max(0, parseInt(days || 0));
    const h = Math.max(0, parseInt(hours || 0));
    const m = Math.max(0, parseInt(minutes || 0));
    
    // Calculate total duration in seconds
    const durationInSeconds = (d * SECONDS_PER_DAY) + 
                            (h * SECONDS_PER_HOUR) + 
                            (m * SECONDS_PER_MINUTE);
    
    // Get current time in seconds since epoch
    const now = Math.floor(Date.now() / 1000);
    
    // Calculate unlock time
    const unlockTime = now + durationInSeconds;
    
    // Debug logging
    console.log('Unlock time calculation:', {
        input: { days: d, hours: h, minutes: m },
        durationInSeconds,
        now: new Date(now * 1000).toLocaleString(),
        unlock: new Date(unlockTime * 1000).toLocaleString(),
        nowTimestamp: now,
        unlockTimestamp: unlockTime,
        expectedDurationMinutes: (durationInSeconds / 60)
    });
    
    return unlockTime;
};

const getRemainingTime = (unlockTimestamp) => {
    // Ensure we're working with numbers
    const timestamp = parseInt(unlockTimestamp);
    const now = Math.floor(Date.now() / 1000);
    
    // Calculate remaining time in seconds
    const remaining = Math.max(0, timestamp - now);
    
    // Calculate each time component ensuring no negative values
    const days = Math.max(0, Math.floor(remaining / SECONDS_PER_DAY));
    const hours = Math.max(0, Math.floor((remaining % SECONDS_PER_DAY) / SECONDS_PER_HOUR));
    const minutes = Math.max(0, Math.floor((remaining % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE));
    const seconds = Math.max(0, Math.floor(remaining % SECONDS_PER_MINUTE));
    
    // Debug logging
    console.log('Remaining time calculation:', {
        unlockTimestamp: timestamp,
        now,
        remaining,
        asComponents: { days, hours, minutes, seconds },
        unlockDate: new Date(timestamp * 1000).toLocaleString(),
        currentDate: new Date(now * 1000).toLocaleString(),
        remainingMinutes: (remaining / 60).toFixed(2)
    });
    
    return {
        days,
        hours,
        minutes,
        seconds,
        total: remaining,
        canUnlock: now >= timestamp
    };
};

const isExpired = (unlockTimestamp) => {
    const now = Math.floor(Date.now() / 1000);
    return now >= parseInt(unlockTimestamp);
};

const formatRemaining = (days, hours, minutes, seconds) => {
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
    return parts.join(' ');
};

// Helper function to validate timestamp
const validateTimestamp = (timestamp) => {
    const parsed = parseInt(timestamp);
    if (isNaN(parsed) || parsed < 0) {
        throw new Error('Invalid timestamp');
    }
    return parsed;
};

module.exports = {
    getUnlockTimestamp,
    getRemainingTime,
    isExpired,
    formatRemaining,
    validateTimestamp,
    SECONDS_PER_DAY,
    SECONDS_PER_HOUR,
    SECONDS_PER_MINUTE
};