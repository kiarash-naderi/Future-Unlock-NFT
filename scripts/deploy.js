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

async function saveDeploymentInfo(info) {
    const deploymentsDir = path.join(__dirname, "../deployments");
    
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }

    const filePath = path.join(deploymentsDir, `${hre.network.name}.json`);
    
    let deployments = {};
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");
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
        // Get the deployer's address
        const [deployer] = await hre.ethers.getSigners();
        console.log(`Deploying contracts with account: ${await deployer.getAddress()}`);
        
        // Get initial balance
        const balance = await deployer.provider.getBalance(deployer.getAddress());
        console.log(`Account balance: ${hre.ethers.formatEther(balance)} ETH\n`);

        // Deploy TimeLockedNFT
        console.log("Deploying TimeLockedNFT contract...");
        const TimeLockedNFT = await hre.ethers.getContractFactory("TimeLockedNFT");
        const timeLockedNFT = await TimeLockedNFT.deploy();
        await timeLockedNFT.waitForDeployment();
        
        const contractAddress = await timeLockedNFT.getAddress();
        console.log(`TimeLockedNFT deployed to: ${contractAddress}`);

        // Save deployment information
        const deploymentInfo = {
            contractName: "TimeLockedNFT",
            address: contractAddress,
            deployer: await deployer.getAddress(),
            transactionHash: timeLockedNFT.deploymentTransaction().hash,
            args: []
        };
        await saveDeploymentInfo(deploymentInfo);

        // Wait for block confirmations
        console.log("\nWaiting for block confirmations...");
        const CONFIRMATIONS = 5;
        await timeLockedNFT.deploymentTransaction().wait(CONFIRMATIONS);

        // Verify contract
        await verifyContract(contractAddress, []);

        // Final balance check
        const finalBalance = await deployer.provider.getBalance(deployer.getAddress());
        console.log(`\nDeployment cost: ${hre.ethers.formatEther(balance - finalBalance)} ETH`);
        console.log("Deployment completed successfully!");

    } catch (error) {
        console.error("Error during deployment:", error);
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});