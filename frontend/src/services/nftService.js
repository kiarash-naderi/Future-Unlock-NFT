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
        
        const now = Math.floor(Date.now() / 1000); // current timestamp in seconds
        const unlockTime = now + 
            (formData.lockDays * 24 * 60 * 60) +
            (formData.lockHours * 60 * 60) +
            (formData.lockMinutes * 60);
        
        console.log('Current time:', new Date(now * 1000).toLocaleString());
        console.log('Unlock time:', new Date(unlockTime * 1000).toLocaleString());
        
        const tx = await contract.mintNFT({
            recipient: formData.recipient,
            content: formData.content,
            lockDays: formData.lockDays,
            lockHours: formData.lockHours,
            lockMinutes: formData.lockMinutes,
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

        const tokenId = mintEvent ? contract.interface.parseLog({
            topics: mintEvent.topics,
            data: mintEvent.data
        }).args.tokenId.toString() : null;

        return {
            success: true,
            transactionHash: receipt.hash,
            tokenId,
            metadataURI
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