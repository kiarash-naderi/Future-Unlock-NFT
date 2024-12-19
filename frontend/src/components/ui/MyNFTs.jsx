import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { getContract } from '../../config/contractConfig';
import NFTCard3D from './NFTCard3D';
import NFTFilters from './NFTFilters';
import LoadingScreen from './LoadingScreen';
import { BrowserProvider } from 'ethers';
const { formatRemaining, getRemainingTime } = require('../../utils/timeUtils');

const MyNFTs = ({ onClose, walletAddress }) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loadError, setLoadError] = useState(null);

  const loadUserNFTs = async () => {
    if (!walletAddress) return;
    try {
      setLoading(true);
      setLoadError(null);
      const contract = await getContract();
      
      // Get total balance of NFTs for current user
      const balance = await contract.balanceOf(walletAddress);
      const totalNFTs = Number(balance);

      console.log(`Loading ${totalNFTs} NFTs for address:`, walletAddress);

      // Get all NFTs for current user
      const nftPromises = Array.from({ length: totalNFTs }, async (_, index) => {
        try {
          // Get tokenId for each NFT owned by user
          const tokenId = await contract.tokenOfOwnerByIndex(walletAddress, index);
          
          // Get NFT data using existing getNFTData function
          const data = await contract.getNFTData(tokenId);

          return {
            tokenId: tokenId.toString(),
            content: data.content || '',
            isUnlocked: data.isUnlocked || false,
            templateId: data.templateId?.toString() || '0',
            unlockTimestamp: data.unlockTimestamp ? 
              Number(data.unlockTimestamp) : null,
            title: data.title || '',
            description: data.description || ''
          };
        } catch (error) {
          console.error(`Error fetching NFT at index ${index}:`, error);
          return null;
        }
      });

      const nftDetails = (await Promise.all(nftPromises)).filter(Boolean);
      setNfts(nftDetails);
      
    } catch (error) {
      console.error('Error loading NFTs:', error);
      setLoadError(error.message);
      setNfts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserNFTs();
  }, []);


  useEffect(() => {
    const setupTransferListener = async () => {
      try {
        const contract = await getContract();
        
        contract.on('Transfer', (from, to, tokenId) => {

          if (from.toLowerCase() === walletAddress?.toLowerCase() || 
            to.toLowerCase() === walletAddress?.toLowerCase()) {
            loadUserNFTs();
          }
        });

        return () => {
          contract.removeAllListeners('Transfer');
        };
      } catch (error) {
        console.error('Error setting up transfer listener:', error);
      }
    };

    if (walletAddress) {
      setupTransferListener();
    }

    return () => {
      const cleanup = async () => {
        try {
          const contract = await getContract();
          contract.removeAllListeners('Transfer');
        } catch (error) {
          console.error('Error removing transfer listener:', error);
        }
      };
      cleanup();
    };
  }, [walletAddress]);

  const handleUnlock = async (tokenId) => {
    try {
      setLoading(true);
      const contract = await getContract();
      const tx = await contract.unlock(tokenId);
      await tx.wait();
      console.log('NFT unlocked successfully:', tokenId);
      await loadUserNFTs();
    } catch (error) {
      console.error('Error unlocking NFT:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedNFTs = () => {
    if (!nfts || nfts.length === 0) {
      return [];
    }

    let filtered = [...nfts];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(nft => 
        nft.tokenId.toLowerCase().includes(searchTerm.toLowerCase()) 
      );
    }

    // Apply status filter
    if (filter === 'locked') {
      filtered = filtered.filter(nft => !nft.isUnlocked);
    } else if (filter === 'unlocked') {
      filtered = filtered.filter(nft => nft.isUnlocked);
    }

    // Apply sorting
    const sortFunctions = {
      oldest: (a, b) => Number(a.tokenId) - Number(b.tokenId),
      soonest: (a, b) => {
        if (a.isUnlocked || !a.unlockTimestamp) return 1;
        if (b.isUnlocked || !b.unlockTimestamp) return -1;
        return Number(a.unlockTimestamp) - Number(b.unlockTimestamp);
      },
      newest: (a, b) => Number(b.tokenId) - Number(a.tokenId),
    };

    filtered.sort(sortFunctions[sortBy] || sortFunctions.newest); 
    return filtered;
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gray-900 overflow-y-auto
                 [&::-webkit-scrollbar]:w-1.5
                 [&::-webkit-scrollbar-track]:bg-gradient-to-b from-gray-900/50 to-gray-800/50
                 [&::-webkit-scrollbar-thumb]:bg-gradient-to-b from-blue-600/80 to-indigo-600/80
                 [&::-webkit-scrollbar-thumb]:rounded-full
                 [&::-webkit-scrollbar-thumb]:border-2
                 [&::-webkit-scrollbar-thumb]:border-gray-800/50
                 [&::-webkit-scrollbar-thumb]:hover:from-blue-500 
                 [&::-webkit-scrollbar-thumb]:hover:to-indigo-500
                 [&::-webkit-scrollbar]:hover:w-2
                 transition-all duration-300"
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
      <div className="mt-20 max-w-6xl mx-auto px-6 pb-8">
        <NFTFilters
          currentFilter={filter}
          onFilterChange={setFilter}
          onSearch={setSearchTerm}
        />

        {loading && (
          <LoadingScreen 
            status="Loading your NFTs..." 
            state={loadError ? "error" : "loading"}
            error={loadError}
            onRetry={loadUserNFTs}
          />
        )}

        {filteredAndSortedNFTs().length === 0 ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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
}

export default MyNFTs;
