const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function getDeploymentAddress(contractName) {
    const deploymentsPath = path.join(__dirname, '../deployments');
    const network = hre.network.name;
    const filePath = path.join(deploymentsPath, `${network}.json`);

    if (!fs.existsSync(filePath)) {
        throw new Error(`No deployment found for network ${network}`);
    }

    const deployments = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!deployments[contractName]) {
        throw new Error(`Contract ${contractName} not found in deployments`);
    }

    return deployments[contractName].address;
}

async function main() {
    try {
        console.log("Starting contract verification process...");
        
        // Get network details
        const network = hre.network.name;
        console.log(`Network: ${network}`);

        // Get contract address from deployments
        const contractAddress = await getDeploymentAddress("TimeLockedNFT");
        console.log(`Contract address: ${contractAddress}`);

        // Verify the contract
        console.log("Verifying contract...");
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: [], // اگر سازنده آرگومانی دارد، اینجا اضافه کنید
            contract: "contracts/TimeLockedNFT.sol:TimeLockedNFT" // مسیر دقیق قرارداد
        });

        console.log("Contract verified successfully!");
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("Contract is already verified!");
        } else {
            console.error("Error during verification:");
            console.error(error);
            process.exitCode = 1;
        }
    }
}

// اجرای اسکریپت
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { main };