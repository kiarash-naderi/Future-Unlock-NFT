const { isAddress } = require('web3-validator');
const { getContract, dateToTimestamp } = require('../config/contractConfig');

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
        
        const unlockTime = dateToTimestamp(
            formData.days,
            formData.hours,
            formData.minutes
        );

        const tx = await contract.mintNFT(
            formData.message,
            unlockTime
        );

        const receipt = await tx.wait();
        
        return {
            success: true,
            transactionHash: receipt.transactionHash,
            tokenId: receipt.events?.find(e => e.event === 'Transfer')?.args?.tokenId?.toString()
        };
    } catch (error) {
        console.error('Error creating NFT:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const isNFTUnlockable = async (tokenId) => {
    try {
        const contract = await getContract();
        const currentTime = Math.floor(Date.now() / 1000);
        const unlockTime = await contract.unlockTimes(tokenId);
        
        return {
            success: true,
            isUnlockable: currentTime >= unlockTime.toNumber(),
            unlockTime: unlockTime.toNumber()
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