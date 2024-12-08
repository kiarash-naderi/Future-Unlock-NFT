const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function verifyContract(address, args) {
    if (hre.network.name === "localhost" || hre.network.name === "hardhat") return;
    
    console.log("Verifying contract...");
    try {
        await hre.run("verify:verify", {
            address: address,
            constructorArguments: args,
        });
        console.log("Contract verified successfully");
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("Contract already verified!");
        } else {
            console.error("Error verifying contract:", error);
        }
    }
}

async function saveDeployment(info) {
    const filePath = path.join(__dirname, "../deployments.json");
    let deployments = {};
    
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        deployments = JSON.parse(content);
    }

    deployments[info.contractName] = {
        address: info.address,
        deployer: info.deployer,
        deploymentTime: new Date().toISOString(),
        transactionHash: info.transactionHash,
        constructorArguments: info.args,
        network: {
            name: hre.network.name,
            chainId: hre.network.config.chainId,
        }
    };

    fs.writeFileSync(filePath, JSON.stringify(deployments, null, 2));
    console.log(`Deployment info saved to ${filePath}`);
}

async function main() {
    try {
        const [deployer] = await hre.ethers.getSigners();
        console.log(`Deploying contracts with account: ${deployer.address}`);
        
        const balance = await hre.ethers.provider.getBalance(deployer.address);
        console.log(`Account balance: ${hre.ethers.formatEther(balance)} ETH\n`);

        console.log("Deploying TimeLockedNFT contract...");
        const TimeLockedNFT = await hre.ethers.getContractFactory("TimeLockedNFT");
        const timeLockedNFT = await TimeLockedNFT.deploy();
        
        // Wait for the deployment transaction
        await timeLockedNFT.waitForDeployment();
        const contractAddress = await timeLockedNFT.getAddress();
        
        console.log(`TimeLockedNFT deployed to: ${contractAddress}`);

        // Save deployment info
        await saveDeployment({
            contractName: "TimeLockedNFT",
            address: contractAddress,
            deployer: deployer.address,
            transactionHash: timeLockedNFT.deploymentTransaction().hash,
            args: [] // No constructor arguments
        });

        // Wait for block confirmations and verify
        if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
            console.log("\nWaiting for block confirmations...");
            // Wait for 5 blocks
            await timeLockedNFT.deploymentTransaction().wait(5);

            console.log("\nVerifying contract...");
            await verifyContract(contractAddress, []);
        }

        console.log("\nDeployment completed successfully!");
    } catch (error) {
        console.error("Deployment failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });