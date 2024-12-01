// scripts/getUnlockData.js
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

        try {
            // Get NFT content and status
            const [content, message, isUnlocked] = await contract.getNFTContent(tokenId);
            
            console.log("\nNFT Status:");
            console.log("-----------------");
            console.log("Is Unlocked:", isUnlocked);
            console.log("Custom Message:", message);

            if (!isUnlocked) {
                // Get remaining lock time
                const [remainingDays, remainingHours, remainingMinutes] = 
                    await contract.getRemainingLockTime(tokenId);
                
                console.log("\nRemaining Lock Time:");
                console.log(`Days: ${remainingDays}`);
                console.log(`Hours: ${remainingHours}`);
                console.log(`Minutes: ${remainingMinutes}`);
            }

            if (isUnlocked && content) {
                console.log("\nDecrypted Content:", content);
            }

            // Get NFT metadata
            const owner = await contract.ownerOf(tokenId);
            console.log("\nOwner:", owner);

            // Get lock time configuration
            const [lockDays, lockHours, lockMinutes, totalSeconds] = 
                await contract.getLockTimeConfig(tokenId);
            
            console.log("\nLock Configuration:");
            console.log(`Initial Lock Days: ${lockDays}`);
            console.log(`Initial Lock Hours: ${lockHours}`);
            console.log(`Initial Lock Minutes: ${lockMinutes}`);
            console.log(`Total Lock Seconds: ${totalSeconds}`);

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

module.exports = { main };