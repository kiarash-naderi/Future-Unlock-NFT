const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

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

async function checkNFTStatus(contract, tokenId) {
    // Get NFT data
    const data = await contract.getNFTData(tokenId);
    const owner = await contract.ownerOf(tokenId);
    const currentTime = Math.floor(Date.now() / 1000);

    return {
        tokenId,
        owner,
        isUnlocked: data.isUnlocked,
        content: data.isUnlocked ? data.content : "",
        title: data.title,
        description: data.description,
        mediaType: data.mediaType,
        isTransferable: data.isTransferable,
        currentTime,
        metadata: data.metadata
    };
}

async function main() {
    try {
        console.log("Checking NFT unlock status...");
        console.log("Network:", hre.network.name);

        // Get deployment info
        const deployment = await getDeploymentInfo();
        console.log("Contract address:", deployment.address);

        // Get contract instance
        const TimeLockedNFT = await hre.ethers.getContractFactory("TimeLockedNFT");
        const contract = TimeLockedNFT.attach(deployment.address);

        // Get token ID (default to 1 if not provided)
        const tokenId = process.env.TOKEN_ID || 1;
        console.log("\nChecking Token ID:", tokenId);

        const status = await checkNFTStatus(contract, tokenId);
        
        console.log("\nNFT Status:");
        console.log("-----------------");
        console.log(`Token ID: ${status.tokenId}`);
        console.log(`Owner: ${status.owner}`);
        console.log(`Is Unlocked: ${status.isUnlocked}`);
        console.log(`Title: ${status.title}`);
        console.log(`Media Type: ${status.mediaType}`);
        console.log(`Is Transferable: ${status.isTransferable}`);
        
        if (status.isUnlocked) {
            console.log(`\nContent: ${status.content}`);
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
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { main, checkNFTStatus };