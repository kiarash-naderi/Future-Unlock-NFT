import React, { useState } from 'react';
import NFTGrid from './components/NFTGrid';
import CreateForm from './components/CreateForm';
import ContractTest from './components/ContractTest'; // اضافه کردن کامپوننت تست
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Clock, Gift, Send, Check, ArrowLeft, Wrench } from 'lucide-react';

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
  <div className="w-48 p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm">
    <Icon className="w-8 h-8 text-blue-400 mb-4 mx-auto" />
    <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-400">{description}</p>
  </div>
);

// Intro Screen Component
const IntroScreen = ({ onStart }) => (
  <div className="text-center space-y-6">
    <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
      Welcome to Time-Locked NFT Creator
    </h1>
    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
      Create unique NFTs that unlock at specific times in the future. Perfect for time capsules, 
      scheduled reveals, and special messages.
    </p>
    <div className="flex justify-center gap-8 py-12">
      <Feature icon={Clock} title="Time Lock" description="Set custom unlock times" />
      <Feature icon={Gift} title="Surprise" description="Perfect for special moments" />
      <Feature icon={Send} title="Transfer" description="Send to any address" />
    </div>
    <button
      onClick={onStart}
      className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-4 rounded-xl
                text-xl font-medium hover:scale-105 transition-transform duration-300
                flex items-center gap-2 mx-auto"
    >
      Get Started
      <ChevronRight className="w-5 h-5" />
    </button>
  </div>
);

// Success Screen Component
const SuccessScreen = ({ transactionHash, onReset }) => (
  <div className="text-center space-y-6">
    <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
      <Check className="w-12 h-12 text-green-500" />
    </div>
    <h2 className="text-3xl font-bold text-white">NFT Created Successfully!</h2>
    <p className="text-gray-400">Your time-locked NFT has been created and sent.</p>
    <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl max-w-lg mx-auto">
      <p className="text-sm text-gray-300 break-all">{transactionHash}</p>
    </div>
    <button
      onClick={onReset}
      className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
    >
      Create Another NFT
    </button>
  </div>
);

// Back Button Component
const BackButton = ({ onClick, show }) => {
  if (!show) return null;
  
  return (
    <button
      onClick={onClick}
      className="absolute left-8 top-8 flex items-center gap-2 text-gray-400 hover:text-white
                transition-colors duration-200 group"
    >
      <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
      <span>Back</span>
    </button>
  );
};

// Step Content Component
const StepContent = ({ step, onStart, selectedNFT, onNFTSelect, onSubmit, transactionHash, onReset }) => {
  switch (step) {
    case 0:
      return <IntroScreen onStart={onStart} />;
    case 1:
      return (
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 text-center mb-8">
            Choose Your NFT Template
          </h2>
          <NFTGrid selectedNFT={selectedNFT} onSelect={onNFTSelect} />
        </div>
      );
    case 2:
      return (
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 text-center mb-8">
            Customize Your NFT
          </h2>
          <CreateForm 
            selectedNFT={selectedNFT} 
            onSubmit={onSubmit}
          />
        </div>
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

// Main App Component
const App = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [transactionHash, setTransactionHash] = useState(null);
  const [showTest, setShowTest] = useState(false); // برای نمایش/مخفی کردن پنل تست
  
  const totalSteps = 4;

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // If going back from NFT customization, clear selected NFT
      if (currentStep === 2) {
        setSelectedNFT(null);
      }
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleNFTSelect = (nft) => {
    setSelectedNFT(nft);
    handleNextStep();
  };

  const handleFormSubmit = async (formData) => {
    console.log('Submitting form data:', formData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTransactionHash('0x123...abc');
    handleNextStep();
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedNFT(null);
    setTransactionHash(null);
  };

  const showBackButton = currentStep > 0 && currentStep < 3;

  return (
    <div className="min-h-screen bg-gradient-to-t from-black to-gray-900 p-8">
      {/* دکمه تست در گوشه سمت راست بالا */}
      <button
        onClick={() => setShowTest(!showTest)}
        className="fixed top-4 right-4 p-2 bg-gray-800/50 backdrop-blur-sm rounded-full hover:bg-gray-700/50 transition-colors"
        title="Toggle Test Panel"
      >
        <Wrench className="w-5 h-5 text-gray-400" />
      </button>

      {/* پنل تست */}
      {showTest && (
        <div className="fixed inset-y-0 right-0 w-96 bg-gray-900/95 backdrop-blur-sm border-l border-gray-800 p-4 overflow-y-auto z-50">
          <ContractTest />
        </div>
      )}

      <div className="relative max-w-6xl mx-auto">
        <BackButton onClick={handlePrevStep} show={showBackButton} />
        
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <StepContent
              step={currentStep}
              onStart={handleNextStep}
              selectedNFT={selectedNFT}
              onNFTSelect={handleNFTSelect}
              onSubmit={handleFormSubmit}
              transactionHash={transactionHash}
              onReset={handleReset}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {selectedNFT && currentStep === 2 && (
        <div className="fixed top-8 right-8 w-80 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          <h3 className="text-lg font-medium text-white mb-2">NFT Preview</h3>
          <div className="aspect-square rounded-lg overflow-hidden mb-3">
            <img 
              src={selectedNFT.image} 
              alt={selectedNFT.name}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm text-gray-300">{selectedNFT.name}</p>
        </div>
      )}
    </div>
  );
};

export default App;