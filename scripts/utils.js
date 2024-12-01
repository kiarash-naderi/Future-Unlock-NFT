// scripts/utils.js

const fs = require('fs');
const path = require('path');

// برای رمزنگاری محتوا
async function encryptContent(content) {
    // در این نسخه فقط برمیگردونیم، اما در نسخه نهایی باید رمزنگاری بشه
    return content;
}

// دریافت قرارداد دیپلوی شده
async function getDeployedContract(contractName) {
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

    const contract = await hre.ethers.getContractFactory(contractName);
    return await contract.attach(deployments[contractName].address);
}

module.exports = {
    encryptContent,
    getDeployedContract
};