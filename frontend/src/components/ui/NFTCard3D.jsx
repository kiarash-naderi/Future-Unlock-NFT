import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Clock } from 'lucide-react';

const NFTCard3D = ({ nft, onUnlock }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Animation variants for the floating effect
  const floatingAnimation = {
    hover: {
      y: -10,
      rotateY: 10,
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover="hover"
      variants={floatingAnimation}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ perspective: 1000 }}
      className="relative transform-gpu"
    >
      <motion.div
        animate={{
          rotateY: isHovered ? 10 : 0,
          boxShadow: isHovered 
            ? "20px 20px 60px rgba(0, 0, 0, 0.3), -20px -20px 60px rgba(255, 255, 255, 0.05)"
            : "0px 0px 30px rgba(0, 0, 0, 0.2)"
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        className="bg-gray-800/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50"
      >
        {/* Card Content */}
        <div className="p-6 space-y-4">
          {/* Header */}
          <motion.div 
            className="flex items-center justify-between"
            animate={{ z: isHovered ? 50 : 0 }}
          >
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
              {nft.title}
            </h3>
            {nft.isUnlocked ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-green-500/20 p-2 rounded-full"
              >
                <Unlock className="w-5 h-5 text-green-400" />
              </motion.div>
            ) : (
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotateZ: isHovered ? [0, -10, 0] : 0
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-yellow-500/20 p-2 rounded-full"
              >
                <Lock className="w-5 h-5 text-yellow-400" />
              </motion.div>
            )}
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {nft.isUnlocked ? (
              <UnlockedContent key="unlocked" nft={nft} isHovered={isHovered} />
            ) : (
              <LockedContent key="locked" nft={nft} isHovered={isHovered} onUnlock={onUnlock} />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Reflection effect */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent
                   transform rotate-180 translate-y-full rounded-2xl"
        />
      )}
    </motion.div>
  );
};

const UnlockedContent = ({ nft, isHovered }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="space-y-4"
  >
    <motion.div
      animate={{ z: isHovered ? 30 : 0 }}
      className="aspect-video bg-gray-900/50 rounded-xl overflow-hidden"
    >
      <img 
        src={nft.image || "/api/placeholder/400/300"}
        alt={nft.title}
        className="w-full h-full object-cover"
      />
    </motion.div>
    <motion.div
      animate={{ z: isHovered ? 20 : 0 }}
      className="space-y-2"
    >
      <div className="text-sm text-green-400">Unlocked Content:</div>
      <div className="bg-gray-900/50 p-4 rounded-xl text-white">
        {nft.content}
      </div>
    </motion.div>
  </motion.div>
);

const LockedContent = ({ nft, isHovered, onUnlock }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="space-y-4"
  >
    <motion.div
      animate={{ z: isHovered ? 30 : 0 }}
      className="aspect-video bg-gray-900/50 rounded-xl relative overflow-hidden"
    >
      {/* Lock icon with glow effect */}
      <motion.div
        animate={{ 
          opacity: [0.5, 1, 0.5],
          scale: isHovered ? 1.1 : 1
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative">
          <Lock className="w-16 h-16 text-gray-600" />
          <motion.div
            animate={{ 
              opacity: [0, 0.5, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-blue-500 filter blur-xl"
          />
        </div>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90" />
    </motion.div>

    <motion.div
      animate={{ z: isHovered ? 20 : 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 text-blue-400">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Time Remaining:</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {['days', 'hours', 'minutes'].map((unit) => (
          <motion.div
            key={unit}
            className="bg-gray-900/50 p-3 rounded-xl text-center relative overflow-hidden"
            whileHover={{ scale: 1.05, z: 40 }}
          >
            <motion.div
              className="text-2xl font-bold text-white"
              animate={{
                opacity: [1, 0.7, 1]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {nft.remainingTime[unit]}
            </motion.div>
            <div className="text-xs text-gray-400 uppercase">
              {unit}
            </div>
            {/* Glowing border effect */}
            <motion.div
              animate={{
                opacity: [0, 0.2, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 border-2 border-blue-500/50 rounded-xl"
            />
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05, z: 50 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onUnlock(nft.tokenId)}
        className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 
                 hover:to-teal-600 text-white py-3 px-4 rounded-xl transition-all
                 duration-300 font-medium relative overflow-hidden group"
      >
        <span className="relative z-10">Unlock NFT</span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-600"
          initial={{ x: '100%' }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
    </motion.div>
  </motion.div>
);

export default NFTCard3D;