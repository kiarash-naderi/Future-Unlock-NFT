import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const ExactUnlockDisplay = ({ nft, onUnlock }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = Math.floor(Date.now() / 1000);
            const unlockTime = Number(nft.unlockTimestamp);
            const difference = unlockTime - now;

            if (difference <= 0 || nft.isUnlocked) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(difference / 86400),
                hours: Math.floor((difference % 86400) / 3600),
                minutes: Math.floor((difference % 3600) / 60),
                seconds: Math.floor(difference % 60)
            };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [nft.unlockTimestamp, nft.isUnlocked]);

    const now = Math.floor(Date.now() / 1000);
    const canUnlock = now >= Number(nft.unlockTimestamp);

    if (canUnlock) {
        return (
            <button
                onClick={() => onUnlock(nft.tokenId)}
                className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg
                          flex items-center justify-center gap-2"
            >
                <span>🔓 Unlock Now</span>
            </button>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-blue-400/80 text-[13px]">
                <Clock className="w-3.5 h-3.5" />
                <span>Time until unlock</span>
            </div>
            <div className="flex justify-between px-1">
                <TimeBlock value={timeLeft.days} label="Days" />
                <TimeBlock value={timeLeft.hours} label="Hours" />
                <TimeBlock value={timeLeft.minutes} label="Mins" />
                <TimeBlock value={timeLeft.seconds} label="Secs" />
            </div>
        </div>
    );
};

const TimeBlock = ({ value, label }) => (
    <div className="flex flex-col items-center">
        <span className="text-[15px] font-medium text-blue-400">
            {String(value).padStart(2, '0')}
        </span>
        <span className="text-[11px] text-gray-500 mt-0.5">
            {label}
        </span>
    </div>
);

export default ExactUnlockDisplay;