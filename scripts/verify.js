const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

// Constants for retry mechanism
const RETRY_COUNT = 3;
const DELAY_MS = 30000; // 30 seconds

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

async function verifyWithRetry(address, constructorArgs) {
    for (let attempt = 1; attempt <= RETRY_COUNT; attempt++) {
        try {
            console.log(`Verification attempt ${attempt}/${RETRY_COUNT}`);
            await hre.run("verify:verify", {
                address: address,
                constructorArguments: constructorArgs
            });
            console.log("Contract verified successfully!");
            return true;
        } catch (error) {
            if (error.message.includes("Already Verified")) {
                console.log("Contract is already verified!");
                return true;
            }
            
            if (attempt < RETRY_COUNT) {
                console.log(`Verification failed. Retrying in ${DELAY_MS/1000} seconds...`);
                await new Promise(r => setTimeout(r, DELAY_MS));
            } else {
                throw error;
            }
        }
    }
    return false;
}

async function main() {
    try {
        console.log("Starting contract verification process...");
        console.log("Network:", hre.network.name);

        // Skip verification for local networks
        if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
            console.log("Skipping verification on local network");
            return;
        }

        const deployment = await getDeploymentInfo();
        console.log("Contract address:", deployment.address);

        console.log("\nStarting verification process...");
        await verifyWithRetry(deployment.address, []);

    } catch (error) {
        console.error("Verification failed:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

module.exports = {
    verifyWithRetry,
    getDeploymentInfo
};