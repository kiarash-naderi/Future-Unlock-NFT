// ContentModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const ContentModal = ({ isOpen, onClose, nft, template }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(24px)'
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 50, opacity: 0 }}
                animate={{ 
                    scale: 1, 
                    y: 0, 
                    opacity: 1,
                    transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                    }
                }}
                exit={{ scale: 0.9, y: 50, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="relative bg-gradient-to-b from-gray-900/90 to-gray-800/90 
                           rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl
                           border border-gray-700/50"
            >
                {/* Top gradient border */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-75" />
                
                {/* Close button with hover effect */}
                <motion.button
                    className="absolute top-4 right-4 p-2 rounded-full 
                               bg-gray-800/50 hover:bg-gray-700/50 transition-colors
                               border border-gray-700/50 z-10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                >
                    <X className="w-5 h-5 text-gray-400" />
                </motion.button>

                {/* Content container with glass effect */}
                <div className="p-8 space-y-6">
                    {/* Image container with hover effect */}
                    <motion.div 
                        className="relative rounded-xl overflow-hidden shadow-2xl"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <img
                            src={template?.image}
                            alt="NFT Content"
                            className="w-full h-full object-cover rounded-xl"
                        />
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </motion.div>

                    {/* Content with animation */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                    >
                        {/* Message content */}
                        <div className="bg-gray-800/40 backdrop-blur-md rounded-xl p-6 
                                      border border-gray-700/50 shadow-lg">
                            <motion.p 
                                className="text-lg text-gray-200 leading-relaxed"
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {nft.content}
                            </motion.p>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom gradient border */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-75" />
            </motion.div>
        </motion.div>
    );
};

export default ContentModal;