import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const LoadingScreen = ({ status }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-50 flex items-center justify-center"
    >
      <div className="text-center space-y-6 max-w-md mx-auto p-8">
        <div className="relative">
          <motion.div
            animate={{ 
              rotateY: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-24 h-24 mx-auto"
          >
            <Lock className="w-full h-full text-blue-400" />
          </motion.div>
          
          {/* Orbiting particles */}
          <motion.div
            animate={{ 
              rotate: 360
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0"
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-blue-400"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 45}deg) translateX(3rem)`
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </div>

        <div className="space-y-2">
          <motion.h3 
            className="text-xl font-bold text-white"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Creating Your Time-Locked NFT
          </motion.h3>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            className="h-1 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full mx-auto"
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />
          <div className="text-sm text-gray-400 font-mono">
            {status || "Processing transaction..."}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;