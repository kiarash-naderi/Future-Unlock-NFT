import React, { useState, useEffect } from 'react';
import NFTGrid from './components/NFTGrid';
import CreateForm from './components/CreateForm';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Clock, Gift, Send, Check, ArrowLeft, Wallet } from 'lucide-react';
import { createTimeLockNFT, connectWallet, checkConnection } from './services/nftService';
import MyNFTs from './components/ui/MyNFTs';
import LoadingScreen from './components/ui/LoadingScreen';
import { nftMetadataService } from './services/nftMetadataService';
import { nftTemplates } from './config/nftTemplates';

// Step Indicator Component
const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {Array.from({ length: totalSteps }, (_, i) => (
      <div
        key={i}
        className={`h-2 rounded-full transition-all duration-300 ${
          i === currentStep ? 'w-8 bg-blue-500' : 'w-2 bg-gray-700'
        }`}
      />
    ))}
  </div>
);

// Feature Component for Intro Screen
const Feature = ({ icon: Icon, title, description }) => (
  <motion.div 
    whileHover={{ scale: 1.05 }}
    className="w-48 p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50
              transition-colors duration-300 hover:bg-gray-800/70 hover:border-gray-600/50"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
    >
      <Icon className="w-8 h-8 text-blue-400 mb-4 mx-auto" />
    </motion.div>
    <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-400">{description}</p>
  </motion.div>
);

// Intro Screen Component
const IntroScreen = ({ onStart, onViewNFTs, walletAddress, setWalletAddress }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="text-center space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400"
      >
        Welcome to Time-Locked NFT Creator
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl text-gray-300 max-w-2xl mx-auto"
      >
        Create unique NFTs that unlock at specific times in the future. Perfect for time capsules, 
        scheduled reveals, and special messages.
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center gap-8 py-12"
      >
        <Feature icon={Clock} title="Time Lock" description="Set custom unlock times" />
        <Feature icon={Gift} title="Surprise" description="Perfect for special moments" />
        <Feature icon={Send} title="Transfer" description="Send to any address" />
      </motion.div>
      <div className="flex flex-col items-center gap-4">
        {!walletAddress ? (
          <motion.div 
            className="relative py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Main Circle */}
            <div className="relative">
              <motion.div
                className="absolute top-[calc(100%-8rem)] left-1/2 transform -translate-x-1/2 w-40 h-40 
                           rounded-full bg-gradient-to-r from-blue-500/10 to-teal-500/10 
                           backdrop-blur-lg flex items-center justify-center border border-blue-500/20"
              >
                {/* Icon */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                       className="w-16 h-16 text-blue-400/80">
                    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
                    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
                  </svg>
                </motion.div>
              </motion.div>

              {/* Outer Glow */}
              <motion.div
                className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-blue-500/5 to-teal-500/5"
                animate={{
                  scale: [1.2, 1.4, 1.2],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>

            <div className="flex flex-col items-center justify-center mt-8">
              <h2 className="text-xl font-bold text-blue-400">
                Waiting for Wallet Connection
              </h2>
              <div className="mt-4">
                <svg className="animate-spin h-10 w-10 text-blue-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 100 12v2a8 8 0 01-8-8z"></path>
                </svg>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-4 rounded-xl
                        text-xl font-medium transition-all duration-300 flex items-center gap-2
                        hover:from-blue-600 hover:to-teal-600 shadow-lg hover:shadow-blue-500/25"
            >
              Get Started
              <ChevronRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onViewNFTs}
              className="bg-gray-800/50 backdrop-blur-sm text-white px-8 py-4 rounded-xl
                        text-xl font-medium hover:bg-gray-700/50 transition-all duration-300
                        border border-gray-700/50 hover:border-gray-600/50"
            >
              View My NFTs
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

// Success Screen Component
const SuccessScreen = ({ transactionHash, onReset }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center space-y-6"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", bounce: 0.5 }}
      className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto"
    >
      <Check className="w-12 h-12 text-green-500" />
    </motion.div>
    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
      NFT Created Successfully!
    </h2>
    <p className="text-gray-400">Your time-locked NFT has been created and sent.</p>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl max-w-lg mx-auto border border-gray-700/50"
    >
      <p className="text-sm text-gray-300 break-all font-mono">{transactionHash}</p>
    </motion.div>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onReset}
      className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-lg
                hover:from-blue-600 hover:to-teal-600 transition-all duration-300 shadow-lg
                hover:shadow-blue-500/25"
    >
      Create Another NFT
    </motion.button>
  </motion.div>
);

// Back Button Component
const BackButton = ({ onClick, show }) => {
  if (!show) return null;
  
  return (
    <motion.button
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      whileHover={{ x: -5 }}
      onClick={onClick}
      className="absolute left-8 top-8 flex items-center gap-2 text-gray-400 hover:text-white
                transition-colors duration-200"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Back</span>
    </motion.button>
  );
};

const pageVariants = {
  initial: {
    scale: 0.8,
    opacity: 0,
    rotateY: -180
  },
  animate: {
    scale: 1,
    opacity: 1,
    rotateY: 0,
    transition: {
      duration: 0.8,
      ease: [0.645, 0.045, 0.355, 1]
    }
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    rotateY: 180,
    transition: {
      duration: 0.8
    }
  }
};

// Step Content Component with enhanced animations
const StepContent = ({ 
  step, 
  onStart, 
  selectedNFT, 
  onNFTSelect, 
  onSubmit, 
  transactionHash, 
  onReset,
  onViewNFTs,
  walletAddress,
  setWalletAddress
}) => {
  switch (step) {
    case 0:
      return (
        <IntroScreen 
          onStart={onStart} 
          onViewNFTs={onViewNFTs} 
          walletAddress={walletAddress}
          setWalletAddress={setWalletAddress}
        />
      );
    case 1:
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 text-center mb-8">
            Choose Your NFT Template
          </h2>
          <NFTGrid selectedNFT={selectedNFT} onSelect={onNFTSelect} />
        </motion.div>
      );
    case 2:
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 text-center mb-8">
            Customize Your NFT
          </h2>
          <CreateForm 
            selectedNFT={selectedNFT} 
            onSubmit={onSubmit}
            walletAddress={walletAddress}
          />
        </motion.div>
      );
    case 3:
      return (
        <SuccessScreen 
          transactionHash={transactionHash} 
          onReset={onReset}
        />
      );
    default:
      return null;
  }
};

// Main App Component with enhanced animations
const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);
  const [showMyNFTs, setShowMyNFTs] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletError, setWalletError] = useState(null);
  const [mintingError, setMintingError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [showWalletAddress, setShowWalletAddress] = useState(true);

  useEffect(() => {
    checkWalletConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      };
    }
  }, []);

  const checkWalletConnection = async () => {
    if (!window.ethereum) return;
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setWalletError(null);
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      setWalletError('Please install MetaMask!');
      return;
    }

    setIsConnecting(true);
    setWalletError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setWalletError(null);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setWalletError(error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      handleDisconnect();
    } else {
      setWalletAddress(accounts[0]);
      setWalletError(null);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setWalletError(null);
  };

  const totalSteps = 4;

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 2) {
        setSelectedNFT(null);
      }
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 0) {
        setShowWalletAddress(false);
      }
    }
  };

  const handleNFTSelect = (nft) => {
    setSelectedNFT(nft);
    handleNextStep();
  };

const handleFormSubmit = async (formData) => {
  try {
      const mintData = {
          recipient: formData.recipient,
          content: formData.message, 
          lockDays: formData.days,
          lockHours: formData.hours, 
          lockMinutes: formData.minutes,
          templateId: selectedNFT.id,
          title: selectedNFT.name,
          description: selectedNFT.description,
          mediaType: selectedNFT.mediaType,
          isTransferable: true,
          isEncrypted: false
      };

      setIsCreating(true);
      setMintingError(null);

      const metadataURI = await nftMetadataService.uploadMetadata(formData, selectedNFT.id, nftTemplates);
      mintData.metadataURI = metadataURI;

      const result = await createTimeLockNFT(mintData);
      
      if (result.success) {
          setTransactionHash(result.transactionHash);
          handleNextStep();
      } else {
          console.error('Failed to create NFT:', result.error);
          alert(`Failed to create NFT: ${result.error}`);
      }
  } catch (error) {
      setMintingError(error.message);
      console.error('Error in form submission:', error);
  } finally {
      setIsCreating(false);
  }
};

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedNFT(null);
    setTransactionHash(null);
  };

  const showBackButton = currentStep > 0 && currentStep < 3;

  const handleStart = () => {
    setIsStarted(true);
    setShowWalletAddress(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-t from-black to-gray-900 p-8 relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        style={{
          backgroundImage: "radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
          backgroundSize: "200% 200%"
        }}
      />

      {/* Wallet Connection Button */}
      <div className="fixed top-4 right-4 z-50">
        {(showWalletAddress || currentStep === 0) && walletAddress && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 
                       rounded-xl p-3 flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="font-mono text-sm text-gray-300">
              {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
            </span>
            <button
              onClick={handleDisconnect}
              className="ml-2 text-gray-400 hover:text-gray-300"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.div>
            </button>
          </motion.div>
        )}
        
        {(showWalletAddress || currentStep === 0) && !walletAddress && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-2 
                       rounded-xl text-sm font-medium flex items-center gap-2
                       hover:from-blue-600 hover:to-teal-600 shadow-lg 
                       hover:shadow-blue-500/25 disabled:opacity-50"
          >
            <Wallet className="w-4 h-4" />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </motion.button>
        )}
      </div>

      {isCreating && (
        <LoadingScreen 
          status="Creating your time-locked NFT..." 
          state={mintingError ? "error" : "loading"}
          error={mintingError}
          onRetry={handleFormSubmit}
        />
      )}
      
      <div className="relative max-w-6xl mx-auto">
        <BackButton onClick={handlePrevStep} show={showBackButton} />
        
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        
        <AnimatePresence mode="wait">
          {showMyNFTs ? (
            <MyNFTs 
              onClose={() => setShowMyNFTs(false)} 
              walletAddress={walletAddress}
            />
          ) : (
            <StepContent
              step={currentStep}
              onStart={handleNextStep}
              selectedNFT={selectedNFT}
              onNFTSelect={handleNFTSelect}
              onSubmit={handleFormSubmit}
              transactionHash={transactionHash}
              onReset={handleReset}
              onViewNFTs={() => setShowMyNFTs(true)}
              walletAddress={walletAddress}
              setWalletAddress={setWalletAddress}
            />
          )}
        </AnimatePresence>
      </div>

      {/* NFT Preview with enhanced animations */}
      <AnimatePresence>
        {selectedNFT && currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            className="fixed top-8 right-8 w-80 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 
                     border border-gray-700/50 shadow-xl"
          >
            <h3 className="text-lg font-medium text-white mb-2">NFT Preview</h3>
            <motion.div 
              className="aspect-square rounded-lg overflow-hidden mb-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img 
                src={selectedNFT.image} 
                alt={selectedNFT.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <p className="text-sm text-gray-300">{selectedNFT.name}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {walletError && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 mt-4"
        >
          {walletError}
        </motion.p>
      )}
    </div>
  );
};

export default App;