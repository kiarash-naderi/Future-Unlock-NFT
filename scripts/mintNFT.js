// scripts/mintNFT.js
const hre = require("hardhat");
const { getDeployedContract, encryptContent } = require("./utils");

async function main() {
    try {
        // Get the contract instance
        const contract = await getDeployedContract("TimeLockedNFT");
        const [creator] = await hre.ethers.getSigners();

        // تنظیم پارامترهای NFT
        const predefinedIndex = 0; // استفاده از اولین قالب پیش‌فرض
        const originalContent = "This is the secret content that will be revealed later";
        const encryptedContent = await encryptContent(originalContent);
        
        // تنظیم زمان قفل: 7 روز، 0 ساعت، 0 دقیقه
        const lockDays = 7;
        const lockHours = 0;
        const lockMinutes = 0;
        
        const customMessage = "Your special message will be revealed in 7 days!";

        console.log("Creating time-locked NFT...");
        console.log(`Lock Time: ${lockDays} days, ${lockHours} hours, ${lockMinutes} minutes`);

        const tx = await contract.createNFT(
            await creator.getAddress(),
            predefinedIndex,
            encryptedContent,
            lockDays,
            lockHours,
            lockMinutes,
            customMessage,
            true // isTransferable
        );

        // Wait for confirmation
        const receipt = await tx.wait();
        const event = receipt.logs.find(
            log => contract.interface.parseLog(log).name === 'NFTCreated'
        );

        if (event) {
            const parsedEvent = contract.interface.parseLog(event);
            const tokenId = parsedEvent.args[0];
            const unlockTime = parsedEvent.args[2];
            
            console.log(`\nNFT created successfully!`);
            console.log(`Token ID: ${tokenId}`);
            console.log(`Unlock Time: ${new Date(Number(unlockTime) * 1000).toLocaleString()}`);
            console.log(`Transaction Hash: ${receipt.hash}`);

            // Get remaining time
            const [remainingDays, remainingHours, remainingMinutes] = 
                await contract.getRemainingLockTime(tokenId);
            
            console.log("\nRemaining Lock Time:");
            console.log(`Days: ${remainingDays}`);
            console.log(`Hours: ${remainingHours}`);
            console.log(`Minutes: ${remainingMinutes}`);
        }

    } catch (error) {
        console.error("Error creating NFT:", error);
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});