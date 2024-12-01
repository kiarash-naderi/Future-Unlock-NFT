const { getContract } = require('../config/contractConfig');
const { validateFormData, createTimeLockNFT, isNFTUnlockable } = require('../services/nftService');

const runCompleteTest = async () => {
    try {
        console.log('🔍 Starting complete test...');

        // 1. Test Contract Connection
        console.log('\n1️⃣ Testing contract connection...');
        const contract = await getContract();
        const name = await contract.name();
        const owner = await contract.owner();
        console.log('✅ Contract connected successfully');
        console.log('📝 Contract name:', name);
        console.log('👤 Contract owner:', owner);

        // 2. Test Form Data Validation
        console.log('\n2️⃣ Testing form data validation...');
        const testFormData = {
            message: 'Test NFT Message',
            days: 0,
            hours: 1,
            minutes: 0,
            recipient: '0x0B8b6B610e0D5902F0bca6B5a2Da3dc7fb0b2c30'
        };
        
        const validation = validateFormData(testFormData);
        if (!validation.isValid) {
            throw new Error('Form validation failed: ' + JSON.stringify(validation.errors));
        }
        console.log('✅ Form validation passed');

        // 3. Test NFT Creation
        console.log('\n3️⃣ Testing NFT creation...');
        const creationResult = await createTimeLockNFT(testFormData);
        if (!creationResult.success) {
            throw new Error('NFT creation failed: ' + creationResult.error);
        }
        console.log('✅ NFT created successfully');
        console.log('📜 Transaction hash:', creationResult.transactionHash);
        console.log('🎫 Token ID:', creationResult.tokenId);

        // 4. Test NFT Lock Status
        console.log('\n4️⃣ Testing NFT lock status...');
        const lockStatus = await isNFTUnlockable(creationResult.tokenId);
        console.log('🔒 Is NFT unlockable:', lockStatus.isUnlockable);
        console.log('⏰ Unlock time:', new Date(lockStatus.unlockTime * 1000).toLocaleString());

        return {
            success: true,
            details: {
                contractName: name,
                contractOwner: owner,
                tokenId: creationResult.tokenId,
                transactionHash: creationResult.transactionHash,
                unlockTime: lockStatus.unlockTime,
                owner
            }
        };

    } catch (error) {
        console.error('❌ Test failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const displayTestResults = (results) => {
    if (results.success) {
        console.log('\n====== Test Results ======');
        console.log('Contract Name:', results.details.contractName);
        console.log('Contract Owner:', results.details.contractOwner);
        console.log('Token ID:', results.details.tokenId);
        console.log('Transaction Hash:', results.details.transactionHash);
        console.log('Unlock Time:', new Date(results.details.unlockTime * 1000).toLocaleString());
        console.log('Owner:', results.details.owner);
        console.log('========================\n');
    } else {
        console.error('\n====== Test Failed ======');
        console.error('Error:', results.error);
        console.error('========================\n');
    }
};

module.exports = {
    runCompleteTest,
    displayTestResults
};