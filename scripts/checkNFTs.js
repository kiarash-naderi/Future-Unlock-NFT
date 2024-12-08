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
        const contract = await TimeLockedNFT.attach("0x25a2A0b7dCC1a2F721f95ceCC9Fc375C50Bc0E3e");

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
            console.log("Unlock Time:", new Date(nftData.unlockTimestamp.toString() * 1000).toLocaleString());
            console.log("Content:", nftData.content || "[Locked]");
            console.log("Title:", nftData.title);
            console.log("Description:", nftData.description);
            console.log("Media Type:", nftData.mediaType);
            console.log("Is Transferable:", nftData.isTransferable);
            
            // Calculate and display the remaining time
            const currentTime = Math.floor(Date.now() / 1000);
            const remainingTime = nftData.isUnlocked ? 0 : (nftData.unlockTimestamp - BigInt(currentTime));
            console.log("Remaining Time (seconds):", remainingTime > 0 ? remainingTime.toString() : "Already Unlocked");
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