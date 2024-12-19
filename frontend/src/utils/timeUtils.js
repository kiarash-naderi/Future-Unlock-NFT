
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;

async function getAccurateTime() {
    try {
        const response = await fetch('http://worldtimeapi.org/api/timezone/Etc/UTC');
        const data = await response.json();
        return Math.floor(new Date(data.datetime).getTime() / 1000);
    } catch (error) {
        console.error('Error fetching time from API:', error);
        return Math.floor(Date.now() / 1000);
    }
}

const getUnlockTimestamp = async (days, hours, minutes) => {
    // Parse inputs and ensure they're non-negative
    const d = Math.max(0, parseInt(days || 0));
    const h = Math.max(0, parseInt(hours || 0));
    const m = Math.max(0, parseInt(minutes || 0));
    
    // Calculate total duration in seconds
    const durationInSeconds = (d * SECONDS_PER_DAY) + 
                            (h * SECONDS_PER_HOUR) + 
                            (m * SECONDS_PER_MINUTE);
    
    // Get accurate time from API
    const now = await getAccurateTime();
    
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

const getRemainingTime = async (unlockTimestamp) => {
    const now = await getAccurateTime();
    const remaining = Math.max(0, unlockTimestamp - now);
    
    const days = Math.floor(remaining / SECONDS_PER_DAY);
    const hours = Math.floor((remaining % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
    const minutes = Math.floor((remaining % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
    const seconds = Math.floor(remaining % SECONDS_PER_MINUTE);
    
    return {
        days,
        hours,
        minutes,
        seconds,
        total: remaining,
        canUnlock: now >= unlockTimestamp
    };
};

module.exports = {
    getUnlockTimestamp,
    getRemainingTime,
    getAccurateTime,
    SECONDS_PER_DAY,
    SECONDS_PER_HOUR,
    SECONDS_PER_MINUTE
};