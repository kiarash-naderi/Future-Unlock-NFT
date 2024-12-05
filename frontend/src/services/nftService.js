const { isAddress } = require('web3-validator');
const { getContract, formatLockTime } = require('../config/contractConfig');

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
        const contract = await getContract();
        
        // Get formatted lock time
        const lockTime = formatLockTime(
            formData.days,
            formData.hours,
            formData.minutes
        );

        console.log('Creating NFT with params:', {
            message: formData.message,
            lockTime,
            recipient: formData.recipient
        });

        // Call mintNFT with new parameters
        const tx = await contract.mintNFT(
            formData.recipient,
            formData.message,
            lockTime.lockDays,
            lockTime.lockHours,
            lockTime.lockMinutes,
            1, // templateId
            "ipfs://test", // metadataURI
            "Time Locked NFT", // title
            formData.message, // description
            "text", // mediaType
            true, // isTransferable
            true, // isEncrypted
            {
                gasLimit: 500000
            }
        );

        console.log('Transaction sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('Transaction receipt:', receipt);

        // Find NFTMinted event instead of Transfer
        const mintEvent = receipt.logs.find(log => {
            try {
                const parsed = contract.interface.parseLog({
                    topics: log.topics,
                    data: log.data
                });
                return parsed.name === "NFTMinted";
            } catch {
                return false;
            }
        });

        return {
            success: true,
            transactionHash: receipt.hash,
            tokenId: mintEvent ? contract.interface.parseLog({
                topics: mintEvent.topics,
                data: mintEvent.data
            }).args.tokenId.toString() : null
        };
    } catch (error) {
        console.error('Detailed error:', error);
        return {
            success: false,
            error: error.message || 'Transaction failed'
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
        console.error('Error checking NFT unlock status:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    validateFormData,
    createTimeLockNFT,
    isNFTUnlockable
};