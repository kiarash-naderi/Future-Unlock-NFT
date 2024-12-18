const { isAddress } = require('web3-validator');
const { getContract, formatLockTime } = require('../config/contractConfig');
const { nftMetadataService } = require('./nftMetadataService');
const { nftTemplates } = require('../config/nftTemplates');

const connectWallet = async () => {
    try {
        if (!window.ethereum) {
            throw new Error("Please install MetaMask");
        }

        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        return {
            success: true,
            address: accounts[0]
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

const checkConnection = async () => {
    try {
        if (!window.ethereum) return { connected: false };
        
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        return {
            connected: accounts.length > 0,
            address: accounts[0]
        };
    } catch {
        return { connected: false };
    }
};

const validateFormData = (formData) => {
    const errors = {};

    if (!formData.message.trim()) {
        errors.message = 'Message is required';
    }

    if (!formData.recipient.trim()) {
        errors.recipient = 'Recipient address is required';
    } else if (!isAddress(formData.recipient)) {
        errors.recipient = 'Invalid Ethereum address';
    }

    if (formData.days === 0 && formData.hours === 0 && formData.minutes === 0) {
        errors.time = 'Lock time must be greater than 0';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

const createTimeLockNFT = async (formData) => {
    try {
        console.log('Preparing Mint Data:', formData);
        const contract = await getContract();
        
        const metadataURI = await nftMetadataService.uploadMetadata(
            formData,
            formData.templateId,
            nftTemplates
        );
        
        console.log('Metadata uploaded, URI:', metadataURI);

        // Convert time parameters to integers explicitly
        const lockDays = parseInt(formData.lockDays) || 0;
        const lockHours = parseInt(formData.lockHours) || 0;
        const lockMinutes = parseInt(formData.lockMinutes) || 0;

        // Log the time parameters being sent to the contract
        console.log('Time parameters:', {
            days: lockDays,
            hours: lockHours,
            minutes: lockMinutes,
            totalMinutes: (lockDays * 24 * 60) + (lockHours * 60) + lockMinutes
        });
        
        const tx = await contract.mintNFT({
            recipient: formData.recipient,
            content: formData.content,
            lockDays: lockDays,
            lockHours: lockHours,
            lockMinutes: lockMinutes,
            templateId: formData.templateId,
            metadataURI: metadataURI,
            title: formData.title,
            description: formData.description,
            mediaType: formData.mediaType,
            isTransferable: formData.isTransferable,
            isEncrypted: formData.isEncrypted
        });

        console.log('Minting transaction submitted:', tx.hash);

        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);

        const mintEvent = receipt.logs.find(log => {
            try {
                return contract.interface.parseLog({
                    topics: log.topics,
                    data: log.data
                }).name === "NFTMinted";
            } catch {
                return false;
            }
        });

        if (!mintEvent) {
            throw new Error('NFT Minted event not found in transaction logs');
        }

        const parsedLog = contract.interface.parseLog({
            topics: mintEvent.topics,
            data: mintEvent.data
        });

        const tokenId = parsedLog.args.tokenId.toString();
        const unlockTime = parsedLog.args.unlockTime.toString();

        // Verify the unlock time is correct
        console.log('NFT Created:', {
            tokenId,
            unlockTime,
            expectedUnlock: new Date(Number(unlockTime) * 1000).toISOString(),
            intendedDuration: {
                days: lockDays,
                hours: lockHours,
                minutes: lockMinutes
            }
        });

        return {
            success: true,
            transactionHash: receipt.hash,
            tokenId,
            metadataURI,
            unlockTime
        };
    } catch (error) {
        console.error('Error in createTimeLockNFT:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const isNFTUnlockable = async (tokenId) => {
    try {
        const contract = await getContract();
        const nftData = await contract.getNFTData(tokenId);
        
        return {
            success: true,
            isUnlockable: !nftData.isUnlocked && Date.now() >= nftData.unlockTimestamp * 1000,
            unlockTime: nftData.unlockTimestamp
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

const unlockNFT = async (tokenId) => {
    try {
        const contract = await getContract();
        
        // Unlock the NFT first
        const unlockTx = await contract.unlock(tokenId);
        await unlockTx.wait();

        // Retrieve the main NFT data
        const nftData = await contract.getNFTData(tokenId);
        
        // Update metadata with the original message
        const newMetadataURI = await nftMetadataService.updateMetadata(
            tokenId,
            nftData.content, // Original message stored during minting
            nftData.metadataURI
        );

        console.log('NFT unlocked and metadata updated:', {
            tokenId,
            newMetadataURI
        });

        return {
            success: true,
            metadataURI: newMetadataURI
        };
    } catch (error) {
        console.error('Error unlocking NFT:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const getUserNFTs = async (address) => {
    try {
        const contract = await getContract();
        console.log('Getting NFTs for address:', address);
        const nfts = await contract.getUserNFTs(address);
        console.log('NFTs returned from contract:', nfts);
        return nfts;
    } catch (error) {
        console.error('Error getting user NFTs:', error);
        return [];
    }
};

const getNFTData = async (tokenId) => {
    try {
        const contract = await getContract();
        const data = await contract.getNFTData(tokenId);
        return data;
    } catch (error) {
        console.error('Error getting NFT data:', error);
        return null;
    }
};

module.exports = {
    connectWallet,
    checkConnection,
    validateFormData,
    createTimeLockNFT,
    isNFTUnlockable,
    unlockNFT,
    getUserNFTs,
    getNFTData
};