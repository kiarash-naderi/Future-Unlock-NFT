const hre = require("hardhat");
const { getDeployedContract, encryptContent } = require("./utils");

async function main() {
    try {
        // Get the contract instance
        const contract = await getDeployedContract("TimeLockedNFT");
        const [creator] = await hre.ethers.getSigners();

        // Input parameters from environment
        const predefinedIndex = process.env.NFT_INDEX || 0;  // Selected NFT index (0-19)
        const content = process.env.CONTENT || "This is the secret content";  // Encrypted content
        const unlockDays = process.env.UNLOCK_DAYS || 7;  // Number of lock days
        const customMessage = process.env.MESSAGE || "Your special message will be revealed soon!";  // Display message
        const isTransferable = process.env.TRANSFERABLE === "true";  // Transferability

        // Encrypt content
        const encryptedContent = await encryptContent(content);
        
        // Calculate unlock time
        const unlockTime = Math.floor(Date.now() / 1000) + (unlockDays * 24 * 60 * 60);

        console.log("\nCreating NFT with following parameters:");
        console.log(`Template Index: ${predefinedIndex}`);
        console.log(`Unlock Time: ${new Date(unlockTime * 1000).toLocaleString()}`);
        console.log(`Custom Message: ${customMessage}`);
        console.log(`Transferable: ${isTransferable}`);

        // Create NFT
        const tx = await contract.createNFT(
            await creator.getAddress(),  // Recipient
            predefinedIndex,             // Default NFT index
            encryptedContent,            // Encrypted content
            unlockTime,                  // Unlock time
            customMessage,               // Display message
            isTransferable               // Transferability
        );

        console.log("\nTransaction sent. Waiting for confirmation...");
        const receipt = await tx.wait();

        // Check NFT creation event
        const event = receipt.logs.find(
            log => contract.interface.parseLog(log).name === 'NFTCreated'
        );

        if (event) {
            const tokenId = event.args[0];
            console.log(`\nNFT created successfully!`);
            console.log(`Token ID: ${tokenId}`);
            console.log(`Unlock Time: ${new Date(unlockTime * 1000).toLocaleString()}`);
            console.log(`Transaction Hash: ${receipt.hash}`);
        }

    } catch (error) {
        console.error("Error creating NFT:", error);
        process.exitCode = 1;
    }
}

if (require.main === module) {
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}