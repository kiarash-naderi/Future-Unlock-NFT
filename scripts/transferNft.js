const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        console.log("Starting NFT transfer process...");
        console.log("Network:", hre.network.name);

        const [sender] = await hre.ethers.getSigners();
        const deployment = await getDeploymentInfo();
        const TimeLockedNFT = await hre.ethers.getContractFactory("TimeLockedNFT");
        const contract = TimeLockedNFT.attach(deployment.address);

        // تغییر توکن آیدی به 1
        const tokenId = process.env.TOKEN_ID || 1;
        const recipient = process.env.RECIPIENT_ADDRESS || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

        console.log("\nTransfer Details:");
        console.log("Token ID:", tokenId);
        console.log("From:", sender.address);
        console.log("To:", recipient);

        // چک کردن وضعیت NFT قبل از ترنسفر
        const data = await contract.getNFTData(tokenId);
        console.log("\nNFT Status:");
        console.log("Is Unlocked:", data.isUnlocked);
        console.log("Is Transferable:", data.isTransferable);

        if (!data.isUnlocked) {
            throw new Error("NFT is still locked and cannot be transferred");
        }

        if (!data.isTransferable) {
            throw new Error("NFT is not transferable");
        }

        // انجام ترنسفر
        console.log("\nInitiating transfer...");
        const tx = await contract.transferFrom(sender.address, recipient, tokenId);
        console.log("Waiting for confirmation...");
        
        await tx.wait();
        
        // تأیید ترنسفر
        const newOwner = await contract.ownerOf(tokenId);
        console.log("\nTransfer successful!");
        console.log("New owner:", newOwner);

    } catch (error) {
        console.error("\nError during transfer:");
        console.error(error.message);
        process.exitCode = 1;
    }
}

async function getDeploymentInfo() {
    const deploymentsPath = path.join(__dirname, '../deployments.json');
    if (!fs.existsSync(deploymentsPath)) {
        throw new Error('No deployments.json file found');
    }
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
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