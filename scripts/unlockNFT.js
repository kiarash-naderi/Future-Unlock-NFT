const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function getDeploymentInfo() {
    const deploymentsPath = path.join(__dirname, '../deployments');
    const network = hre.network.name;
    const filePath = path.join(deploymentsPath, `${network}.json`);

    if (!fs.existsSync(filePath)) {
        throw new Error(`No deployment found for network ${network}`);
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function main() {
    try {
        console.log("Starting NFT unlock process...");

        // Get network details
        const network = hre.network.name;
        console.log(`Network: ${network}`);

        // Get contract details from deployment
        const deployments = await getDeploymentInfo();
        const contractAddress = deployments.TimeLockedNFT.address;
        console.log(`Contract address: ${contractAddress}`);

        // Get the contract instance
        const TimeLockedNFT = await hre.ethers.getContractFactory("TimeLockedNFT");
        const contract = await TimeLockedNFT.attach(contractAddress);

        // Get the token ID from command line or use default
        const tokenId = process.env.TOKEN_ID || 1;
        console.log(`Attempting to unlock NFT with token ID: ${tokenId}`);

        // Check if NFT exists and get current status
        try {
            const [content, message, isUnlocked] = await contract.getNFTContent(tokenId);
            console.log("Current NFT status:");
            console.log("- Is Unlocked:", isUnlocked);
            console.log("- Custom Message:", message);
            
            if (isUnlocked) {
                console.log("NFT is already unlocked!");
                return;
            }
        } catch (error) {
            if (error.message.includes("Token does not exist")) {
                console.error(`NFT with token ID ${tokenId} does not exist!`);
                return;
            }
            throw error;
        }

        // Unlock the NFT
        console.log("Unlocking NFT...");
        const tx = await contract.unlockNFT(tokenId);
        console.log("Transaction sent. Waiting for confirmation...");
        
        const receipt = await tx.wait();
        
        // Get unlock event
        const unlockEvent = receipt.logs.find(
            log => contract.interface.parseLog(log).name === 'NFTUnlocked'
        );

        if (unlockEvent) {
            console.log("NFT successfully unlocked!");
            
            // Get updated content
            const [content, message, isUnlocked] = await contract.getNFTContent(tokenId);
            console.log("\nNFT Content after unlock:");
            console.log("- Is Unlocked:", isUnlocked);
            console.log("- Custom Message:", message);
            if (content) {
                console.log("- Content:", content);
            }
        }

    } catch (error) {
        console.error("Error during NFT unlock process:");
        console.error(error.message || error);
        process.exitCode = 1;
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { main };