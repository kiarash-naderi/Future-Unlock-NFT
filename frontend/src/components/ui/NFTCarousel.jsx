import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const NFTCarousel = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let newIndex = prevIndex + newDirection;
      if (newIndex >= items.length) newIndex = 0;
      if (newIndex < 0) newIndex = items.length - 1;
      return newIndex;
    });
  };

  const item = items[currentIndex];

  return (
    <div className="relative w-full max-w-2xl mx-auto h-[500px] flex items-center justify-center">
      {/* Previous Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute left-4 z-10 bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center text-white"
        onClick={() => paginate(-1)}
      >
        <ChevronLeft className="w-6 h-6" />
      </motion.button>

      <div className="relative w-80 h-96 overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute w-full h-full"
          >
            <div className="w-full h-full p-4">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 h-full flex flex-col">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm text-white">{item.type}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                <p className="text-gray-400 text-sm flex-grow">{item.description}</p>
                <button 
                  onClick={() => item.onSelect(item)}
                  className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Select Template
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute right-4 z-10 bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center text-white"
        onClick={() => paginate(1)}
      >
        <ChevronRight className="w-6 h-6" />
      </motion.button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'w-6 bg-blue-500' : 'bg-gray-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default NFTCarousel;