import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';

const NFTFilters = ({ onFilterChange, onSearch, currentFilter }) => {
  const handleSearch = (value) => {

    const searchTerm = value.toLowerCase();
    onSearch(searchTerm);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 mb-8"
    >
      {/* Search Input */}
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Search by token ID..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl
                   text-white placeholder:text-gray-500 focus:outline-none focus:ring-2
                   focus:ring-blue-500/50 transition-all duration-300"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      </div>

      {/* Filters */}
      <motion.div 
        className="flex items-center gap-2 bg-gray-800/50 p-1 rounded-xl"
        layout
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onFilterChange('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                   ${currentFilter === 'all' 
                     ? 'bg-blue-500 text-white' 
                     : 'hover:bg-gray-700/50 text-gray-400'}`}
        >
          All
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onFilterChange('locked')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                   ${currentFilter === 'locked' 
                     ? 'bg-blue-500 text-white' 
                     : 'hover:bg-gray-700/50 text-gray-400'}`}
        >
          Locked
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onFilterChange('unlocked')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                   ${currentFilter === 'unlocked' 
                     ? 'bg-blue-500 text-white' 
                     : 'hover:bg-gray-700/50 text-gray-400'}`}
        >
          Unlocked
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default NFTFilters;