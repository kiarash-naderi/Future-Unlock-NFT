import React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Clock, X, Eye, Hash } from 'lucide-react';
import { nftTemplates } from '../../config/nftTemplates';
import ContentModal from './ContentModal';
import {
    getRemainingTime,
    formatRemaining,
    isExpired
} from '../../utils/timeUtils';
import LoadingScreen from './LoadingScreen';
import { ethers } from 'ethers';

const SECONDS_PER_DAY = 86400;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;

const NFTCard3D = React.forwardRef(({ nft, onUnlock }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const template = nftTemplates.find(t => t.id.toString() === nft.templateId?.toString());
    const [unlockError, setUnlockError] = useState(null);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isImported, setIsImported] = useState(false);

    const CountdownTimer = ({ unlockTimestamp }) => {
        const [timeLeft, setTimeLeft] = useState(() => {
            return getRemainingTime(unlockTimestamp);
        });

        useEffect(() => {
            const timer = setInterval(() => {
                const remaining = getRemainingTime(unlockTimestamp);
                setTimeLeft(remaining);

                if (remaining.canUnlock) {
                    clearInterval(timer);
                }
            }, 1000);

            return () => clearInterval(timer);
        }, [unlockTimestamp]);

        return (
            <div className="mt-2 py-2 px-3 bg-gray-800/40 rounded-lg">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-blue-400/80 mb-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">Time until unlock</span>
                    </div>
                    <div className="flex justify-between">
                        {[
                            { value: timeLeft.days, label: 'Days' },
                            { value: timeLeft.hours, label: 'Hours' },
                            { value: timeLeft.minutes, label: 'Mins' },
                            { value: timeLeft.seconds, label: 'Secs' }
                        ].map((item) => (
                            <div key={item.label} className="flex flex-col items-center min-w-[30px]">
                                <span className="text-blue-400 text-sm font-medium">
                                    {String(item.value).padStart(2, '0')}
                                </span>
                                <span className="text-[9px] text-gray-500 mt-0.5">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const LockedContent = () => {
        // console.log('NFT Data:', nft);

        const now = Math.floor(Date.now() / 1000);
        const unlockTime = Number(nft.unlockTimestamp);

        // console.log('Time Check:', {
        //     now,
        //     unlockTime,
        //     difference: unlockTime - now
        // });

        const canUnlock = now >= unlockTime && !nft.isUnlocked;

        return (
            <motion.div className="space-y-4">
                <motion.div className="aspect-square rounded-xl overflow-hidden relative">
                    <img
                        src={template?.image}
                        alt="NFT"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 backdrop-blur-xl bg-black/50 flex items-center justify-center">
                        <Lock className="w-12 h-12 text-white/50" />
                    </div>
                </motion.div>

                {canUnlock ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onUnlock(nft.tokenId)}
                        className="w-full py-3 bg-blue-700 hover:bg-blue-800 
                                   text-white rounded-lg transition-all
                                   font-medium flex items-center justify-center gap-2
                                   shadow-lg shadow-blue-700/30"
                    >
                        <Unlock className="w-5 h-5" />
                        Unlock Now
                    </motion.button>
                ) : (
                    <CountdownTimer unlockTimestamp={unlockTime} />
                )}
            </motion.div>
        );
    };

    const UnlockedContent = () => (
        <motion.div className="space-y-4">
            {/* Image Container */}
            <motion.div
                className="aspect-square rounded-xl overflow-hidden relative group"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <img
                    src={template?.image}
                    alt="NFT Content"
                    className="w-full h-full object-cover"
                />

                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </motion.div>

            {/* Reveal Button */}
            <motion.button
                onClick={() => setShowContent(true)}
                className="w-full relative group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {/* Button Background with Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-800 to-indigo-800 rounded-xl 
                                opacity-90 group-hover:opacity-100 transition-opacity duration-200" />

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-800/50 to-indigo-800/50 rounded-xl 
                                blur-xl group-hover:blur-2xl opacity-50 transition-all duration-200" />

                {/* Button Content */}
                <div className="relative px-6 py-3 flex items-center justify-center gap-3">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, -10, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        ✨
                    </motion.div>
                    <span className="text-white font-medium">Reveal Content</span>
                    <motion.div
                        initial={{ x: 0 }}
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Eye className="w-5 h-5 text-white" />
                    </motion.div>
                </div>
            </motion.button>
        </motion.div>
    );

    const checkCanUnlock = (unlockDate) => {
        return getRemainingTime(unlockDate).canUnlock;
    };

    const handleUnlock = async () => {
        try {
            setIsUnlocking(true);
            setUnlockError(null);
            await onUnlock(nft.tokenId);
        } catch (error) {
            setUnlockError(error.message);
            console.error('Error unlocking NFT:', error);
        } finally {
            setIsUnlocking(false);
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover="hover"
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="relative transform-gpu"
            >
                <motion.div
                    animate={{
                        rotateY: isHovered ? 10 : 0,
                        boxShadow: isHovered
                            ? "20px 20px 60px rgba(0, 0, 0, 0.3), -20px -20px 60px rgba(255, 255, 255, 0.05)"
                            : "0px 0px 30px rgba(0, 0, 0, 0.2)"
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 p-6"
                >


                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
                            {nft.isUnlocked ? "Unlocked" : "Locked"}
                        </h3>
                        {/* Token ID Badge */}
                        <div className="ml-auto bg-gray-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full
                                  border border-gray-700/50 flex items-center gap-2 group">
                            <Hash className="w-3.5 h-3.5 text-blue-400/80" />
                            <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">
                                {nft.tokenId}
                            </span>
                        </div>
                        {/* Lock Icon with Hover Animation */}
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`ml-2 w-10 h-10 rounded-full flex items-center justify-center ${nft.isUnlocked
                                    ? 'bg-green-500/20 hover:bg-green-500/30'
                                    : 'bg-yellow-500/20 hover:bg-yellow-500/30'
                                } transition-colors duration-200`}
                        >
                            {nft.isUnlocked ? (
                                <Unlock className="w-5 h-5 text-green-400" />
                            ) : (
                                <Lock className="w-5 h-5 text-yellow-400" />
                            )}
                        </motion.div>
                    </div>

                    {/* NFT Content */}
                    {nft.isUnlocked ? (
                        <UnlockedContent />
                    ) : (
                        <LockedContent />
                    )}
                </motion.div>
            </motion.div>

            <ContentModal
                isOpen={showContent}
                onClose={() => setShowContent(false)}
                nft={nft}
                template={template}
            />

            {isUnlocking && (
                <LoadingScreen
                    status="Unlocking your NFT..."
                    state={unlockError ? "error" : "loading"}
                    error={unlockError}
                    onRetry={() => handleUnlock()}
                />
            )}
        </>
    );
});

export default NFTCard3D;