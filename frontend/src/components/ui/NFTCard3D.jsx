import React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Eye, Hash } from 'lucide-react';
import { nftTemplates } from '../../config/nftTemplates';
import ContentModal from './ContentModal';
import LoadingScreen from './LoadingScreen';
import ExactUnlockDisplay from './ExactUnlockDisplay';


const NFTCard3D = React.forwardRef(({ nft, onUnlock }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const template = nftTemplates.find(t => t.id.toString() === nft.templateId?.toString());
    const [unlockError, setUnlockError] = useState(null);
    const [isUnlocking, setIsUnlocking] = useState(false);

    const LockedContent = () => {
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
    
                <ExactUnlockDisplay 
                  nft={nft}
                onUnlock={onUnlock}
               />
            </motion.div>
        );
    };

    const UnlockedContent = () => (
        <motion.div className="space-y-4">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </motion.div>

            <motion.button
                onClick={() => setShowContent(true)}
                className="w-full relative group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-800 to-indigo-800 rounded-xl 
                               opacity-90 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-800/50 to-indigo-800/50 rounded-xl 
                               blur-xl group-hover:blur-2xl opacity-50 transition-all duration-200" />
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
                        <div className="ml-auto bg-gray-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full
                                      border border-gray-700/50 flex items-center gap-2 group">
                            <Hash className="w-3.5 h-3.5 text-blue-400/80" />
                            <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">
                                {nft.tokenId}
                            </span>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`ml-2 w-10 h-10 rounded-full flex items-center justify-center ${
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

                    {nft.isUnlocked ? <UnlockedContent /> : <LockedContent />}
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