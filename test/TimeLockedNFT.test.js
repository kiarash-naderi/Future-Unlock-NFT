const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("TimeLockedNFT Contract", function () {
    let TimeLockedNFT, nftContract;
    let owner, addr1, addr2, addr3;
    const customMessage = "Test Message";
    let MINTER_ROLE;

    beforeEach(async function () {
        TimeLockedNFT = await ethers.getContractFactory("TimeLockedNFT");
        nftContract = await TimeLockedNFT.deploy();
        await nftContract.waitForDeployment();

        [owner, addr1, addr2, addr3] = await ethers.getSigners();
        
        MINTER_ROLE = await nftContract.MINTER_ROLE();
        await nftContract.grantRole(MINTER_ROLE, await owner.getAddress());
    });

    describe("Time Lock Validations", function () {
        it("Should reject creation with zero lock time", async function () {
            await expect(
                nftContract.createNFT(
                    await addr1.getAddress(),
                    0,
                    "Encrypted content",
                    0, // lockDays
                    0, // lockHours
                    0, // lockMinutes
                    customMessage,
                    true
                )
            ).to.be.revertedWith("Invalid lock time");
        });

        it("Should handle time progression correctly", async function () {
            // Lock for 1 hour
            await nftContract.createNFT(
                await addr1.getAddress(),
                1,
                "Encrypted content",
                0,  // lockDays
                1,  // lockHours
                0,  // lockMinutes
                customMessage,
                true
            );

            await expect(
                nftContract.connect(addr1).unlockNFT(1)
            ).to.be.revertedWith("Still locked");

            // Increase time by 1 hour + 1 second
            await time.increase(3601);

            await expect(
                nftContract.connect(addr1).unlockNFT(1)
            ).to.not.be.reverted;
        });

        it("Should return correct remaining time", async function () {
            // Lock for 2 days, 3 hours, 30 minutes
            await nftContract.createNFT(
                await addr1.getAddress(),
                1,
                "Encrypted content",
                2,  // lockDays
                3,  // lockHours
                30, // lockMinutes
                customMessage,
                true
            );

            const [days, hours, minutes] = await nftContract.getRemainingLockTime(1);
            expect(days).to.equal(2);
            expect(hours).to.equal(3);
            expect(minutes).to.equal(30);
        });
    });

    describe("Multiple NFT Transfers", function () {
        beforeEach(async function () {
            // Create NFTs with 1 hour lock time
            await nftContract.createNFT(
                await addr1.getAddress(),
                0,
                "Encrypted content",
                0, // lockDays
                1, // lockHours
                0, // lockMinutes
                customMessage,
                true // isTransferable
            );
        });

        it("Should handle transfers when allowed", async function () {
            await time.increase(3601); // Skip past lock time
            await nftContract.connect(addr1).unlockNFT(1);

            await nftContract.connect(addr1).safeTransferFrom(
                await addr1.getAddress(),
                await addr2.getAddress(),
                1
            );

            expect(await nftContract.ownerOf(1)).to.equal(await addr2.getAddress());
        });

        it("Should prevent transfers when not allowed", async function () {
            await expect(
                nftContract.connect(addr1).safeTransferFrom(
                    await addr1.getAddress(),
                    await addr2.getAddress(),
                    1
                )
            ).to.be.revertedWith("Token not transferable");
        });
    });
});