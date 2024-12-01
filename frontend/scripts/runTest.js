const { runCompleteTest, displayTestResults } = require('../src/test/CompleteTest');

async function main() {
    try {
        console.log('Starting complete contract test...');
        const results = await runCompleteTest();
        displayTestResults(results);
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        process.exit();
    }
}

main();