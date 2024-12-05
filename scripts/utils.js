// scripts/utils.js

const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// For encrypting content
async function encryptContent(content) {
    try {
        // Placeholder for actual encryption
        return content;
    } catch (error) {
        throw new Error(`Encryption failed: ${error.message}`);
    }
}

// Validate Ethereum address
function validateAddress(address) {
    try {
        return ethers.utils.isAddress(address);
    } catch (error) {
        throw new Error(`Address validation failed: ${error.message}`);
    }
}

// Format time remaining in readable format
function formatTime(days, hours, minutes) {
    return `${days}d:${hours}h:${minutes}m`;
}

// Estimate gas with buffer
async function estimateGasWithBuffer(contract, method, args = [], buffer = 1.1) {
    try {
        const estimatedGas = await contract.estimateGas[method](...args);
        return Math.ceil(estimatedGas.toNumber() * buffer);
    } catch (error) {
        throw new Error(`Gas estimation failed: ${error.message}`);
    }
}

// Get deployed contract with enhanced error handling
async function getDeployedContract(contractName) {
    try {
        const deploymentsPath = path.join(__dirname, '../deployments');
        const network = hre.network.name;
        const filePath = path.join(deploymentsPath, `${network}.json`);

        if (!fs.existsSync(filePath)) {
            throw new Error(`No deployment found for network ${network}`);
        }

        const deployments = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!deployments[contractName]) {
            throw new Error(`Contract ${contractName} not found in deployments`);
        }

        if (!validateAddress(deployments[contractName].address)) {
            throw new Error(`Invalid contract address for ${contractName}`);
        }

        const contract = await hre.ethers.getContractFactory(contractName);
        return await contract.attach(deployments[contractName].address);
    } catch (error) {
        throw new Error(`Failed to get deployed contract: ${error.message}`);
    }
}

// Format wei to ETH with specified decimals
function formatEther(wei, decimals = 4) {
    try {
        return Number(ethers.utils.formatEther(wei)).toFixed(decimals);
    } catch (error) {
        throw new Error(`Failed to format ether: ${error.message}`);
    }
}

module.exports = {
    encryptContent,
    getDeployedContract,
    validateAddress,
    formatTime,
    estimateGasWithBuffer,
    formatEther
};