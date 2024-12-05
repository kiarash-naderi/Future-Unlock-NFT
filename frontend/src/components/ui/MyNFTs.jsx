import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { getContract } from '../../config/contractConfig';
import NFTCard3D from './NFTCard3D';
import NFTFilters from './NFTFilters';
import LoadingScreen from './LoadingScreen';

const MyNFTs = ({ onClose }) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadUserNFTs();
  }, []);

  const loadUserNFTs = async () => {
    try {
      setLoading(true);
      const contract = await getContract();
      const userAddress = await contract.signer.getAddress();
      const userNFTs = await contract.getUserNFTs(userAddress);
      
      const nftDetails = await Promise.all(
        userNFTs.map(async (tokenId) => {
          const data = await contract.getNFTData(tokenId);
          const remaining = await contract.getRemainingTime(tokenId);
          
          return {
            tokenId: tokenId.toString(),
            content: data.content,
            title: data.title,
            description: data.description,
            isUnlocked: data.isUnlocked,
            unlockTimestamp: data.unlockTimestamp.toString(),
            remainingTime: {
              days: remaining.lockDays.toString(),
              hours: remaining.lockHours.toString(),
              minutes: remaining.lockMinutes.toString()
            }
          };
        })
      );

      setNfts(nftDetails);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (tokenId) => {
    try {
      setLoading(true);
      const contract = await getContract();
      await contract.unlock(tokenId);
      await loadUserNFTs();
    } catch (error) {
      console.error('Error unlocking NFT:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedNFTs = () => {
    let filtered = [...nfts];

    // Apply filters
    if (filter === 'locked') {
      filtered = filtered.filter(nft => !nft.isUnlocked);
    } else if (filter === 'unlocked') {
      filtered = filtered.filter(nft => nft.isUnlocked);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(nft => 
        nft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => a.tokenId - b.tokenId);
        break;
      case 'soonest':
        filtered.sort((a, b) => {
          if (a.isUnlocked) return 1;
          if (b.isUnlocked) return -1;
          return a.unlockTimestamp - b.unlockTimestamp;
        });
        break;
      default: // newest
        filtered.sort((a, b) => b.tokenId - a.tokenId);
    }

    return filtered;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gray-900"
    >
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button 
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </motion.button>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
              My Time-Locked NFTs
            </h2>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-20 max-w-6xl mx-auto px-6 py-8">
        <NFTFilters
          currentFilter={filter}
          onFilterChange={(value) => {
            if (['all', 'locked', 'unlocked'].includes(value)) {
              setFilter(value);
            } else {
              setSortBy(value);
            }
          }}
          onSearch={setSearchTerm}
        />

        {loading ? (
          <LoadingScreen status="Loading your NFTs..." />
        ) : filteredAndSortedNFTs().length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔎</span>
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">
              {searchTerm 
                ? "No NFTs found matching your search" 
                : "No NFTs found"}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? "Try adjusting your search terms"
                : "You don't have any time-locked NFTs yet"}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="mt-8 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-lg"
            >
              Create Your First NFT
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedNFTs().map((nft) => (
                <NFTCard3D 
                  key={nft.tokenId} 
                  nft={nft} 
                  onUnlock={handleUnlock}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyNFTs;