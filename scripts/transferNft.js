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

async function verifyNFTOwnership(contract, tokenId, owner) {
    const currentOwner = await contract.ownerOf(tokenId);
    return currentOwner.toLowerCase() === owner.toLowerCase();
}

async function main() {
    try {
        console.log("Starting NFT transfer process...");

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

        // Get parameters from environment variables or use defaults
        const tokenId = process.env.TOKEN_ID || 1;
        const recipient = process.env.RECIPIENT_ADDRESS;
        if (!recipient) {
            throw new Error("Recipient address not provided! Set RECIPIENT_ADDRESS in environment.");
        }

        // Get current owner (sender)
        const [sender] = await hre.ethers.getSigners();
        const senderAddress = await sender.getAddress();

        // Verify ownership
        console.log("\nVerifying ownership...");
        const isOwner = await verifyNFTOwnership(contract, tokenId, senderAddress);
        if (!isOwner) {
            throw new Error(`You (${senderAddress}) are not the owner of this NFT!`);
        }

        // Check if NFT is transferable
        console.log("Checking transfer restrictions...");
        const [, , isUnlocked] = await contract.getNFTContent(tokenId);
        
        // Perform transfer
        console.log(`\nTransferring NFT ${tokenId} to ${recipient}...`);
        const tx = await contract.safeTransferFrom(senderAddress, recipient, tokenId);
        console.log("Transfer transaction sent. Waiting for confirmation...");
        
        const receipt = await tx.wait();
        
        // Verify transfer
        const newOwner = await contract.ownerOf(tokenId);
        if (newOwner.toLowerCase() === recipient.toLowerCase()) {
            console.log("\nTransfer successful!");
            console.log("New owner:", newOwner);
            
            // Log transaction details
            console.log("\nTransaction Details:");
            console.log("Transaction Hash:", receipt.hash);
            console.log("Block Number:", receipt.blockNumber);
            console.log("Gas Used:", receipt.gasUsed.toString());
        } else {
            throw new Error("Transfer verification failed!");
        }

    } catch (error) {
        console.error("Error during NFT transfer:");
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

module.exports = { main, verifyNFTOwnership };