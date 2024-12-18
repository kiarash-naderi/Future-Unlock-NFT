const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;

const getUnlockTimestamp = (days, hours, minutes) => {
    // Parse inputs and ensure they're non-negative integers
    const d = Math.max(0, Math.floor(parseInt(days || 0)));
    const h = Math.max(0, Math.floor(parseInt(hours || 0)));
    const m = Math.max(0, Math.floor(parseInt(minutes || 0)));
    
    // Calculate total duration in seconds
    const durationInSeconds = (d * SECONDS_PER_DAY) + 
                            (h * SECONDS_PER_HOUR) + 
                            (m * SECONDS_PER_MINUTE);
    
    // Get current time in seconds since epoch
    const now = Math.floor(Date.now() / 1000);
    
    // Calculate unlock time
    const unlockTime = now + durationInSeconds;
    
    // Add logging to track the calculation
    console.log('Unlock time calculation:', {
        input: { days: d, hours: h, minutes: m },
        durationInSeconds,
        nowDate: new Date(now * 1000).toLocaleString(),
        unlockDate: new Date(unlockTime * 1000).toLocaleString(),
        nowTimestamp: now,
        unlockTimestamp: unlockTime
    });
    
    return unlockTime;
};

const getRemainingTime = (unlockTimestamp) => {
    // Ensure we're working with numbers and floor the values
    const timestamp = Math.floor(parseInt(unlockTimestamp));
    const now = Math.floor(Date.now() / 1000);
    
    // Calculate remaining time in seconds
    const remaining = Math.max(0, timestamp - now);
    
    // Calculate components ensuring no negative values
    const days = Math.max(0, Math.floor(remaining / SECONDS_PER_DAY));
    const hours = Math.max(0, Math.floor((remaining % SECONDS_PER_DAY) / SECONDS_PER_HOUR));
    const minutes = Math.max(0, Math.floor((remaining % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE));
    const seconds = Math.max(0, Math.floor(remaining % SECONDS_PER_MINUTE));
    
    return {
        days,
        hours,
        minutes,
        seconds,
        total: remaining,
        canUnlock: now >= timestamp
    };
};

module.exports = {
    getUnlockTimestamp,
    getRemainingTime,
    SECONDS_PER_DAY,
    SECONDS_PER_HOUR,
    SECONDS_PER_MINUTE
};