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

async function formatTimeRemaining(unlockTime) {
    const now = Math.floor(Date.now() / 1000);
    let remaining = unlockTime - now;
    
    if (remaining < 0) {
        return "Already unlocked";
    }

    const days = Math.floor(remaining / (24 * 60 * 60));
    remaining -= days * 24 * 60 * 60;
    
    const hours = Math.floor(remaining / (60 * 60));
    remaining -= hours * 60 * 60;
    
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

async function main() {
    try {
        console.log("Fetching NFT unlock data...");

        // Get network details
        const network = hre.network.name;
        console.log(`Network: ${network}`);

        // Get contract details
        const deployments = await getDeploymentInfo();
        const contractAddress = deployments.TimeLockedNFT.address;
        console.log(`Contract address: ${contractAddress}`);

        // Get the contract instance
        const TimeLockedNFT = await hre.ethers.getContractFactory("TimeLockedNFT");
        const contract = await TimeLockedNFT.attach(contractAddress);

        // Get token ID from command line or use default
        const tokenId = process.env.TOKEN_ID || 1;

        // Get NFT data
        try {
            // Get unlock date components
            const [year, month, day] = await contract.getUnlockDate(tokenId);
            console.log("\nUnlock Date Information:");
            console.log(`Date: ${year}-${month}-${day}`);

            // Get NFT content and status
            const [content, message, isUnlocked] = await contract.getNFTContent(tokenId);
            
            console.log("\nNFT Status:");
            console.log("- Is Unlocked:", isUnlocked);
            console.log("- Custom Message:", message);

            // If unlocked, show content
            if (isUnlocked && content) {
                console.log("- Content:", content);
            }

            // Get time remaining if not unlocked
            if (!isUnlocked) {
                const timeRemaining = await formatTimeRemaining(unlockTime);
                console.log("\nTime Remaining:", timeRemaining);
            }

        } catch (error) {
            if (error.message.includes("Token does not exist")) {
                console.error(`NFT with token ID ${tokenId} does not exist!`);
                return;
            }
            throw error;
        }

    } catch (error) {
        console.error("Error fetching NFT data:");
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

module.exports = { main, formatTimeRemaining };