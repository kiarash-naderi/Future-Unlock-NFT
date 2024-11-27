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

async function checkNFTStatus(contract, tokenId) {
    const [content, message, isUnlocked] = await contract.getNFTContent(tokenId);
    const owner = await contract.ownerOf(tokenId);
    const currentTime = Math.floor(Date.now() / 1000);

    return {
        tokenId,
        isUnlocked,
        owner,
        message,
        hasContent: content.length > 0
    };
}

async function main() {
    try {
        console.log("Checking NFT unlock status...");

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
            const status = await checkNFTStatus(contract, tokenId);
            
            console.log("\nNFT Status:");
            console.log("-----------------");
            console.log(`Token ID: ${status.tokenId}`);
            console.log(`Unlocked: ${status.isUnlocked}`);
            console.log(`Owner: ${status.owner}`);
            console.log(`Has Content: ${status.hasContent}`);
            if (status.message) {
                console.log(`Message: ${status.message}`);
            }

            // Additional information if not unlocked
            if (!status.isUnlocked) {
                const unlockDate = await contract.getUnlockDate(tokenId);
                console.log("\nUnlock Date:", unlockDate);
            }

        } catch (error) {
            if (error.message.includes("Token does not exist")) {
                console.error(`NFT with token ID ${tokenId} does not exist!`);
                return;
            }
            throw error;
        }

    } catch (error) {
        console.error("Error checking NFT status:");
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

module.exports = { main, checkNFTStatus };