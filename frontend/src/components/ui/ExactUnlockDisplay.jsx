import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Unlock } from 'lucide-react';

// const TIME_BIAS_SECONDS = 300; // Bias to add 5 minutes (300 seconds)

const ExactUnlockDisplay = ({ nft, onUnlock }) => {
    // State to track whether the NFT can be unlocked
    const [canUnlock, setCanUnlock] = useState(false);

    useEffect(() => {
        const unlockTime = Number(nft.unlockTimestamp);

        const updateCanUnlock = () => {
            const now = Math.floor(Date.now() / 1000);
            setCanUnlock(now >= unlockTime);
        };

        // Update immediately and set an interval
        updateCanUnlock();
        const interval = setInterval(updateCanUnlock, 1000); // Update every second

        // Clean up the interval when the component unmounts
        return () => clearInterval(interval);
    }, [nft.unlockTimestamp]);

    // Convert unlock timestamp to formatted date and time
    const unlockTime = Number(nft.unlockTimestamp);
    const unlockDate = new Date(unlockTime * 1000);

    const formattedTime = unlockDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const formattedDate = unlockDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="space-y-4">
            {canUnlock && !nft.isUnlocked ? (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onUnlock(nft.tokenId)}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 
                             hover:from-blue-700 hover:to-blue-800
                             text-white rounded-lg transition-all
                             font-medium flex items-center justify-center gap-2
                             shadow-lg shadow-blue-700/30"
                >
                    <Unlock className="w-5 h-5" />
                    Unlock Now
                </motion.button>
            ) : (
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex items-center gap-1.5 text-blue-400/80">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{formattedDate}</span>
                        </div>
                        <div className="w-px h-4 bg-gray-700" />
                        <div className="flex items-center gap-1.5 text-teal-400/80">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{formattedTime}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExactUnlockDisplay;
