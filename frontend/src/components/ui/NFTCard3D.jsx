import React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Clock, X, Eye } from 'lucide-react';
import { nftTemplates } from '../../config/nftTemplates';
import ContentModal from './ContentModal';

const NFTCard3D = React.forwardRef(({ nft, onUnlock }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const template = nftTemplates.find(t => t.id.toString() === nft.templateId?.toString());

    const CountdownTimer = ({ unlockDate }) => {
        const [timeLeft, setTimeLeft] = useState({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        });

        useEffect(() => {
            const calculateTimeLeft = () => {
                const difference = new Date(unlockDate).getTime() - new Date().getTime();
                
                if (difference <= 0) {
                    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
                }

                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            };

            // اولین اجرای محاسبه زمان
            setTimeLeft(calculateTimeLeft());

            const timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft());
            }, 1000);

            return () => clearInterval(timer);
        }, [unlockDate]);

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
                            { value: timeLeft.minutes, label: 'Min' },
                            { value: timeLeft.seconds, label: 'Sec' }
                        ].map((item) => (
                            <div key={item.label} className="flex flex-col items-center min-w-[30px]">
                                <span className="text-blue-400 text-sm font-medium">
                                    {item.value.toString().padStart(2, '0')}
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
        const now = Math.floor(Date.now() / 1000);
        const unlockTime = new Date(nft.unlockDate).getTime() / 1000;
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
                    <CountdownTimer unlockDate={nft.unlockDate} />
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
                        {/* Lock Icon with Hover Animation */}
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                nft.isUnlocked 
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
        </>
    );
});

export default NFTCard3D;