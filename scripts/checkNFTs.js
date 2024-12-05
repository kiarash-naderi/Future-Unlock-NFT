// scripts/checkNFTs.js
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        console.log("Checking NFTs...");
        console.log("Network:", hre.network.name);

        const [owner] = await hre.ethers.getSigners();
        const TimeLockedNFT = await hre.ethers.getContractFactory("TimeLockedNFT");
        const contract = await TimeLockedNFT.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

        // Checking total number of NFTs
        const totalSupply = await contract.totalSupply();
        console.log("\nTotal NFTs:", totalSupply.toString());

        // Getting the list of NFTs for the receiver's address
        const receiverNFTs = await contract.getUserNFTs(owner.address);
        console.log("\nYour NFTs:", receiverNFTs.toString());

        if (receiverNFTs.length > 0) {
            // Checking the first NFT
            const nftData = await contract.getNFTData(receiverNFTs[0]);
            console.log("\nFirst NFT Data:");
            console.log("Is Unlocked:", nftData.isUnlocked);
            console.log("Unlock Time:", new Date(nftData.unlockTimestamp * 1000).toLocaleString());
            console.log("Content:", nftData.content || "[Locked]");
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });