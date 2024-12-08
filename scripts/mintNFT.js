// scripts/mintNFT.js
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

async function main() {
    try {
        console.log("Starting NFT minting process...");
        console.log("Network:", hre.network.name);

        // Get deployment info
        const deployment = await getDeploymentInfo();
        console.log("Contract address:", deployment.address);

        // Get contract instance
        const TimeLockedNFT = await hre.ethers.getContractFactory("TimeLockedNFT");
        const contract = TimeLockedNFT.attach(deployment.address);

        // Get signer
        const [creator] = await hre.ethers.getSigners();
        
        // Mint parameters
        const mintParams = {
            recipient: creator.address,
            content: "This is the secret content that will be revealed later",
            lockDays: 7,
            lockHours: 0,
            lockMinutes: 0,
            templateId: 1,
            metadataURI: "ipfs://test",
            title: "Test NFT",
            description: "Test Description",
            mediaType: "text",
            isTransferable: true,
            isEncrypted: true
        };

        console.log("\nMinting NFT with parameters:");
        console.log("Recipient:", mintParams.recipient);
        console.log("Lock time:", `${mintParams.lockDays} days, ${mintParams.lockHours} hours, ${mintParams.lockMinutes} minutes`);

        const tx = await contract.mintNFT({
            recipient: mintParams.recipient,
            content: mintParams.content,
            lockDays: mintParams.lockDays,
            lockHours: mintParams.lockHours,
            lockMinutes: mintParams.lockMinutes,
            templateId: mintParams.templateId,
            metadataURI: mintParams.metadataURI,
            title: mintParams.title,
            description: mintParams.description,
            mediaType: mintParams.mediaType,
            isTransferable: mintParams.isTransferable,
            isEncrypted: mintParams.isEncrypted
        });

        console.log("\nTransaction sent, waiting for confirmation...");
        const receipt = await tx.wait();

        // Parse events properly
        const mintEvent = receipt.logs.find(log => {
            try {
                const parsed = contract.interface.parseLog({
                    topics: log.topics,
                    data: log.data
                });
                return parsed.name === "NFTMinted";
            } catch {
                return false;
            }
        });

        if (!mintEvent) {
            throw new Error("NFTMinted event not found in transaction receipt");
        }

        const parsedEvent = contract.interface.parseLog({
            topics: mintEvent.topics,
            data: mintEvent.data
        });

        const tokenId = parsedEvent.args[0];

        console.log("\nNFT Minted Successfully!");
        console.log("Token ID:", tokenId.toString());
        console.log("Transaction Hash:", receipt.hash);

    } catch (error) {
        console.error("Error minting NFT:", error.message || error);
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

module.exports = { main };