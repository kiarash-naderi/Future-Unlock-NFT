import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Clock, 
  Lock, 
  MessageSquare, 
  ChevronDown,
  Loader2
} from 'lucide-react';

const NFTInterface = () => {
  const [selectedNFT, setSelectedNFT] = useState(0);
  const [content, setContent] = useState('');
  const [unlockDays, setUnlockDays] = useState(7);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const nftTemplates = [
    { 
      id: 0, 
      name: "Future Memory #1", 
      description: "A digital time capsule for your memories",
      icon: "🌟"
    },
    { 
      id: 1, 
      name: "Love Letter #1", 
      description: "Send a love letter to the future",
      icon: "💌"
    },
    { 
      id: 2, 
      name: "Birthday Surprise #1", 
      description: "Schedule a birthday surprise",
      icon: "🎁"
    },
    // ... بقیه NFT ها
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // اینجا اتصال به قرارداد و ایجاد NFT
      await new Promise(resolve => setTimeout(resolve, 2000)); // شبیه‌سازی تراکنش
      console.log({ selectedNFT, content, unlockDays, message });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Create Your Time-Locked NFT
          </h1>
          <p className="text-gray-400 mt-2">
            Lock your memories in time, unlock them in the future
          </p>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* NFT Template Selection */}
              <div className="space-y-3">
                <Label className="text-lg font-medium text-gray-200">
                  Choose Your NFT Template
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nftTemplates.map(nft => (
                    <button
                      key={nft.id}
                      type="button"
                      onClick={() => setSelectedNFT(nft.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedNFT === nft.id 
                          ? 'border-blue-500 bg-gray-700' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{nft.icon}</span>
                        <div className="text-left">
                          <h3 className="font-medium text-gray-200">{nft.name}</h3>
                          <p className="text-sm text-gray-400">{nft.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Secret Content */}
              <div className="space-y-3">
                <Label className="text-lg font-medium text-gray-200">
                  <MessageSquare className="inline-block w-5 h-5 mr-2" />
                  Your Secret Content
                </Label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-100"
                  placeholder="Write your message here..."
                />
              </div>

              {/* Unlock Time */}
              <div className="space-y-3">
                <Label className="text-lg font-medium text-gray-200">
                  <Clock className="inline-block w-5 h-5 mr-2" />
                  Unlock After (Days)
                </Label>
                <div className="flex items-center space-x-4">
                  <Input
                    type="range"
                    min="1"
                    max="365"
                    value={unlockDays}
                    onChange={(e) => setUnlockDays(Number(e.target.value))}
                    className="flex-grow"
                  />
                  <span className="w-16 text-center bg-gray-700 rounded-md py-1">
                    {unlockDays}d
                  </span>
                </div>
              </div>

              {/* Display Message */}
              <div className="space-y-3">
                <Label className="text-lg font-medium text-gray-200">
                  <Lock className="inline-block w-5 h-5 mr-2" />
                  Display Message (Before Unlock)
                </Label>
                <Input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-gray-100"
                  placeholder="This message will be visible before unlocking..."
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                {isLoading ? 'Creating NFT...' : 'Create Your Time Capsule'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Progress Preview */}
        <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-xl font-medium text-gray-200 mb-4">Preview</h2>
          <div className="space-y-4">
            <div className="flex items-center text-gray-400">
              <div className="w-1/3">Selected Template:</div>
              <div className="text-gray-200">
                {nftTemplates[selectedNFT]?.name}
              </div>
            </div>
            <div className="flex items-center text-gray-400">
              <div className="w-1/3">Unlock Date:</div>
              <div className="text-gray-200">
                {new Date(Date.now() + unlockDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTInterface;