import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { nftTemplates } from '../config/nftTemplates';

const NFTGrid = ({ selectedNFT, onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const visibleNFTs = Array.from({ length: 3 }, (_, i) => {
    const index = (currentIndex + i) % nftTemplates.length;
    return nftTemplates[index];
  });

  const nextNFT = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % nftTemplates.length);
  };

  const prevNFT = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + nftTemplates.length) % nftTemplates.length);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative flex items-center justify-center gap-6 py-8">
        {/* Navigation Buttons */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={prevNFT}
          className="absolute left-0 z-10 p-3 rounded-full bg-gray-800/80 hover:bg-gray-700/80 
                     text-white transition-colors duration-500 backdrop-blur-sm
                     border border-gray-700 hover:border-gray-600"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>

        {/* NFT Cards Container */}
        <div className="flex gap-6 overflow-hidden px-12">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            {visibleNFTs.map((nft, idx) => {
              const isCenter = idx === 1;
              
              return (
                <motion.div 
                  key={`${nft.id}-${idx}-${currentIndex}`}
                  custom={direction}
                  initial={{ 
                    opacity: 0,
                    x: direction > 0 ? 100 : -100,
                    scale: 0.8
                  }}
                  animate={{ 
                    opacity: isCenter ? 1 : 0.5,
                    x: 0,
                    scale: isCenter ? 1 : 0.9,
                    transition: {
                      delay: 0.1
                    }
                  }}
                  exit={{ 
                    opacity: 0,
                    x: direction > 0 ? -100 : 100,
                    scale: 0.8
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 20,
                    opacity: { duration: 0.4 }
                  }}
                  className={`relative group`}
                  style={{
                    width: isCenter ? '320px' : '288px'
                  }}
                >
                  <motion.div
                    onClick={() => isCenter && onSelect(nft)}
                    whileHover={isCenter ? { scale: 1.03 } : {}}
                    transition={{ duration: 0.4 }}
                    className={`relative overflow-hidden rounded-2xl transition-colors duration-500
                      ${isCenter ? 'cursor-pointer' : 'pointer-events-none filter blur-[2px]'}
                      ${selectedNFT?.id === nft.id ? 'ring-4 ring-blue-500/50' : ''}
                    `}
                  >
                    {/* Card Background */}
                    <div className={`absolute inset-0 bg-gradient-to-b from-gray-800/50 to-gray-900/90 backdrop-blur-sm
                      ${!isCenter ? 'opacity-80' : 'opacity-40'}`} 
                    />
                    
                    {/* NFT Image */}
                    <div className={`relative ${!isCenter ? 'filter blur-[2px]' : ''}`}>
                      <img 
                        src={nft.image} 
                        alt={nft.name}
                        className="w-full h-48 object-cover"
                      />
                      
                      {/* Content */}
                      <div className="p-6 space-y-3">
                        {/* Type Badge */}
                        <motion.span 
                          initial={false}
                          animate={{ opacity: isCenter ? 1 : 0.5 }}
                          transition={{ duration: 0.4 }}
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium 
                                   bg-gray-700/50 text-gray-300"
                        >
                          {nft.mediaType}
                        </motion.span>
                        
                        <motion.h3 
                          initial={false}
                          animate={{ opacity: isCenter ? 1 : 0.5 }}
                          transition={{ duration: 0.4 }}
                          className="text-xl font-bold text-white group-hover:text-blue-400 
                                   transition-colors duration-500"
                        >
                          {nft.name}
                        </motion.h3>
                        
                        <motion.p 
                          initial={false}
                          animate={{ opacity: isCenter ? 1 : 0.5 }}
                          transition={{ duration: 0.4 }}
                          className="text-gray-400 text-sm line-clamp-2"
                        >
                          {nft.description}
                        </motion.p>

                        {/* Select Button - Only visible for center card */}
                        {isCenter && (
                          <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.4 }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelect(nft)}
                            className={`w-full mt-4 py-3 px-4 rounded-xl transition-colors duration-500
                              ${selectedNFT?.id === nft.id
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-200'
                              } backdrop-blur-sm border border-gray-700 hover:border-gray-600`}
                          >
                            {selectedNFT?.id === nft.id ? 'Selected' : 'Select Template'}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={nextNFT}
          className="absolute right-0 z-10 p-3 rounded-full bg-gray-800/80 hover:bg-gray-700/80 
                     text-white transition-colors duration-500 backdrop-blur-sm
                     border border-gray-700 hover:border-gray-600"
        >
          <ChevronRight className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {nftTemplates.map((_, idx) => (
          <motion.button
            key={idx}
            initial={false}
            animate={{
              width: idx === currentIndex ? 24 : 8,
              backgroundColor: idx === currentIndex ? '#3B82F6' : '#4B5563'
            }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.2 }}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className="h-2 rounded-full transition-colors duration-500"
          />
        ))}
      </div>
    </div>
  );
};

export default NFTGrid;