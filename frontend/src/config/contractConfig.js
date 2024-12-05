const { ethers } = require('ethers');

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approved",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ContentUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newUnlockTime",
        "type": "uint256"
      }
    ],
    "name": "LockTimeExtended",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "unlockTime",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "templateId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "mediaType",
        "type": "string"
      }
    ],
    "name": "NFTMinted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "NFTUnlocked",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "MINTER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getNFTData",
    "outputs": [
      {
        "internalType": "string",
        "name": "content",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isUnlocked",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "unlockTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "templateId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "mediaType",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isTransferable",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isEncrypted",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getRemainingTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "lockDays",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lockHours",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lockMinutes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalSeconds",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "content",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "lockDays",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lockHours",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lockMinutes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "templateId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "metadataURI",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "mediaType",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isTransferable",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isEncrypted",
        "type": "bool"
      }
    ],
    "name": "mintNFT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "unlock",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const getContract = async () => {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not installed!');
    }

    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Connected to MetaMask');
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
        );
        
        return contract;
    } catch (error) {
        console.error('Error in getContract:', error);
        throw error;
    }
};

const formatLockTime = (days, hours, minutes) => {
    return {
        lockDays: parseInt(days) || 0,
        lockHours: parseInt(hours) || 0,
        lockMinutes: parseInt(minutes) || 0
    };
};

module.exports = {
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    getContract,
    formatLockTime
};