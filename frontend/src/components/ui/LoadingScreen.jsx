import React from 'react';
import { motion } from 'framer-motion';
import { Lock, AlertTriangle, CheckCircle, Loader, Circle } from 'lucide-react';

const states = {
  loading: {
    icon: Circle,
    title: "Processing Transaction",
    color: "text-blue-400"
  },
  error: {
    icon: AlertTriangle,
    title: "Transaction Failed",
    color: "text-red-400"
  },
  success: {
    icon: CheckCircle,
    title: "Transaction Successful",
    color: "text-green-400"
  }
};

const LoadingScreen = ({ 
  status = "Processing transaction...", 
  state = "loading",
  error = null,
  onClose = null,
  onRetry = null 
}) => {
  const currentState = states[state];
  const StateIcon = currentState.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-50 flex items-center justify-center"
    >
      <div className="text-center">
        <div className="relative mb-0">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
            className={`w-16 h-16 mx-auto -mb-20 ${currentState.color}`}
          >
            <div className="relative w-full h-full">
              <motion.div 
                className="absolute inset-0 rounded-full border border-current opacity-50"
                animate={{
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border border-current opacity-80"
                animate={{
                  scale: [0.8, 1, 0.8],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
            </div>
          </motion.div>

          {state === "loading" && (
            <motion.div
              className="relative w-32 h-32"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: -360 }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2"
                    style={{
                      transform: `rotate(${i * 90}deg) translateY(-24px)`,
                    }}
                  >
                    <motion.div
                      className={`w-1 h-1 rounded-full ${currentState.color}`}
                      animate={{
                        opacity: [0.2, 1, 0.2],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </div>

        <div className="mt-[-20] transform translate-y-[-10px]">
          <motion.h3 
            className={`text-lg font-bold ${currentState.color}`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {currentState.title}
          </motion.h3>

          <p className="text-gray-400 text-sm mt-1">
            {status}
          </p>

          {state === "loading" && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              className="h-0.5 bg-gradient-to-r from-blue-500/50 via-blue-500 to-blue-500/50 
                         rounded-full mx-auto mt-4 max-w-[180px]"
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;