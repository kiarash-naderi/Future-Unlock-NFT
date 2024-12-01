import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { nftTemplates } from '../config/nftTemplates';

const NFTGrid = ({ selectedNFT, onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleNFTs = Array.from({ length: 3 }, (_, i) => {
    const index = (currentIndex + i) % nftTemplates.length;
    return nftTemplates[index];
  });

  const nextNFT = () => {
    setCurrentIndex((prev) => (prev + 1) % nftTemplates.length);
  };

  const prevNFT = () => {
    setCurrentIndex((prev) => (prev - 1 + nftTemplates.length) % nftTemplates.length);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative flex items-center justify-center gap-6 py-8">
        {/* Navigation Buttons */}
        <button 
          onClick={prevNFT}
          className="absolute left-0 z-10 p-3 rounded-full bg-gray-800/80 hover:bg-gray-700/80 
                     text-white transition-all duration-300 hover:scale-110 backdrop-blur-sm
                     border border-gray-700 hover:border-gray-600"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* NFT Cards Container */}
        <div className="flex gap-6 overflow-hidden px-12">
          {visibleNFTs.map((nft, idx) => {
            const isCenter = idx === 1;
            
            return (
              <div 
                key={`${nft.id}-${idx}`}
                className={`relative group transition-all duration-500 ease-out
                  ${isCenter ? 'w-80 opacity-100 scale-100' : 'w-72 opacity-50 scale-90'}
                `}
              >
                <div
                  onClick={() => isCenter && onSelect(nft)}
                  className={`relative overflow-hidden rounded-2xl transition-all duration-300
                    ${isCenter ? 'cursor-pointer transform hover:scale-105' : 'pointer-events-none filter blur-[2px]'}
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
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium 
                                   bg-gray-700/50 text-gray-300">
                        {nft.mediaType}
                      </span>
                      
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 
                                 transition-colors duration-300">
                        {nft.name}
                      </h3>
                      
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {nft.description}
                      </p>

                      {/* Select Button - Only visible for center card */}
                      {isCenter && (
                        <button
                          onClick={() => onSelect(nft)}
                          className={`w-full mt-4 py-3 px-4 rounded-xl transition-all duration-300
                            ${selectedNFT?.id === nft.id
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-200'
                            } backdrop-blur-sm border border-gray-700 hover:border-gray-600
                            transform hover:scale-105`}
                        >
                          {selectedNFT?.id === nft.id ? 'Selected' : 'Select Template'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={nextNFT}
          className="absolute right-0 z-10 p-3 rounded-full bg-gray-800/80 hover:bg-gray-700/80 
                     text-white transition-all duration-300 hover:scale-110 backdrop-blur-sm
                     border border-gray-700 hover:border-gray-600"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default NFTGrid;