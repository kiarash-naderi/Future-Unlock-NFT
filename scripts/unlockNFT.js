const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        console.log("Starting NFT unlock process...");
        console.log("Network:", hre.network.name);

        const [owner] = await hre.ethers.getSigners();
        const deployment = await getDeploymentInfo();
        console.log("Contract address:", deployment.address);

        const TimeLockedNFT = await hre.ethers.getContractFactory("TimeLockedNFT");
        const nftContract = await TimeLockedNFT.attach(deployment.address);

        const tokenId = process.env.TOKEN_ID || 1;
        console.log(`\nAttempting to unlock NFT with token ID: ${tokenId}`);

        // Check ownership before unlock
        const ownerAddress = await nftContract.ownerOf(tokenId);
        const isOwner = ownerAddress === owner.address;
        if (!isOwner) {
            console.log("\n❌ Cannot unlock: You are not the owner of this NFT.");
            return;
        }

        // Get NFT data
        const data = await nftContract.getNFTData(tokenId);
        console.log("\nCurrent NFT Status:");
        console.log("Is Unlocked:", data.isUnlocked);

        // Try to unlock
        const tx = await nftContract.unlock(tokenId);
        await tx.wait();
        
        console.log("NFT unlocked successfully!");

    } catch (error) {
        if (error.message.includes("Still locked")) {
            console.log("\n❌ Cannot unlock: NFT is still locked. Please wait until the lock period ends.");
        } else {
            console.error("\nError during unlock process:", error.message);
        }
        process.exitCode = 1;
    }
}

// Helper function
async function getDeploymentInfo() {
    const deploymentsPath = path.join(__dirname, '../deployments.json');
    if (!fs.existsSync(deploymentsPath)) {
        throw new Error('No deployments.json file found');
    }
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
    if (!deployments.TimeLockedNFT) {
        throw new Error('TimeLockedNFT contract not found in deployments');
    }
    return deployments.TimeLockedNFT;
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}