// src/components/ContractTest.jsx
import React, { useState } from 'react';
import { getContract } from '../config/contractConfig';
import { validateFormData, createTimeLockNFT, isNFTUnlockable } from '../services/nftService';

const ContractTest = () => {
    const [logs, setLogs] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState(null);

    const addLog = (message, type = 'info') => {
        setLogs(prev => [...prev, { message, type, timestamp: new Date().toISOString() }]);
    };

    const runTest = async () => {
        setIsRunning(true);
        setLogs([]);
        try {
            addLog('🔍 Starting complete test...');

            // 1. Test Contract Connection
            addLog('\n1️⃣ Testing contract connection...');
            const contract = await getContract();
            const name = await contract.name();
            const owner = await contract.owner();
            addLog('✅ Contract connected successfully');
            addLog(`📝 Contract name: ${name}`);
            addLog(`👤 Contract owner: ${owner}`);

            // 2. Test Form Data Validation
            addLog('\n2️⃣ Testing form data validation...');
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
            addLog('✅ Form validation passed');

            // 3. Test NFT Creation
            addLog('\n3️⃣ Testing NFT creation...');
            const creationResult = await createTimeLockNFT(testFormData);
            if (!creationResult.success) {
                throw new Error('NFT creation failed: ' + creationResult.error);
            }
            addLog('✅ NFT created successfully');
            addLog(`📜 Transaction hash: ${creationResult.transactionHash}`);
            addLog(`🎫 Token ID: ${creationResult.tokenId}`);

            // 4. Test NFT Lock Status
            addLog('\n4️⃣ Testing NFT lock status...');
            const lockStatus = await isNFTUnlockable(creationResult.tokenId);
            addLog(`🔒 Is NFT unlockable: ${lockStatus.isUnlockable}`);
            addLog(`⏰ Unlock time: ${new Date(lockStatus.unlockTime * 1000).toLocaleString()}`);

            setTestResults({
                success: true,
                details: {
                    contractName: name,
                    contractOwner: owner,
                    tokenId: creationResult.tokenId,
                    transactionHash: creationResult.transactionHash,
                    unlockTime: lockStatus.unlockTime,
                    owner
                }
            });
            
        } catch (error) {
            addLog(`❌ Test failed: ${error.message}`, 'error');
            setTestResults({
                success: false,
                error: error.message
            });
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="p-6 bg-gray-800 rounded-xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Contract Test</h2>
                <button
                    onClick={runTest}
                    disabled={isRunning}
                    className={`px-4 py-2 rounded-lg ${
                        isRunning 
                            ? 'bg-gray-600 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                    } text-white transition-colors`}
                >
                    {isRunning ? 'Running Test...' : 'Run Test'}
                </button>
            </div>

            {/* Test Logs */}
            <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto mb-6 font-mono text-sm">
                {logs.map((log, index) => (
                    <div 
                        key={index}
                        className={`mb-1 ${
                            log.type === 'error' ? 'text-red-400' : 'text-gray-300'
                        }`}
                    >
                        {log.message}
                    </div>
                ))}
            </div>

            {/* Test Results */}
            {testResults && (
                <div className={`p-4 rounded-lg ${
                    testResults.success ? 'bg-green-900/20' : 'bg-red-900/20'
                }`}>
                    <h3 className="text-xl font-bold mb-2 text-white">
                        {testResults.success ? 'Test Results' : 'Test Failed'}
                    </h3>
                    {testResults.success ? (
                        <div className="space-y-1 text-gray-300">
                            <p>Contract Name: {testResults.details.contractName}</p>
                            <p>Contract Owner: {testResults.details.contractOwner}</p>
                            <p>Token ID: {testResults.details.tokenId}</p>
                            <p>Transaction Hash: {testResults.details.transactionHash}</p>
                            <p>Unlock Time: {new Date(testResults.details.unlockTime * 1000).toLocaleString()}</p>
                        </div>
                    ) : (
                        <p className="text-red-400">{testResults.error}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ContractTest;