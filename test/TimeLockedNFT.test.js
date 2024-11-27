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
        it("Should reject creation with past unlock time", async function () {
            const pastTime = Math.floor(Date.now() / 1000) - 3600;
            const metadata = {
                name: "Past Time NFT",
                description: "Test",
                image: "ipfs://test",
                mediaType: "image",
                externalUrl: ""
            };

            await expect(
                nftContract.createNFT(
                    await addr1.getAddress(),
                    metadata,
                    "Encrypted content",
                    pastTime,
                    customMessage,
                    true
                )
            ).to.be.revertedWith("Unlock time must be future");
        });

        it("Should handle time progression correctly", async function () {
            const currentTime = await time.latest();
            const futureTime = currentTime + 3600;
            
            const metadata = {
                name: "Time Test NFT",
                description: "Test",
                image: "ipfs://test",
                mediaType: "image",
                externalUrl: ""
            };

            await nftContract.createNFT(
                await addr1.getAddress(),
                metadata,
                "Encrypted content",
                futureTime,
                customMessage,
                true
            );

            await expect(
                nftContract.connect(addr1).unlockNFT(1)
            ).to.be.revertedWith("Still locked");

            await time.increaseTo(futureTime + 1);

            await expect(
                nftContract.connect(addr1).unlockNFT(1)
            ).to.not.be.reverted;
        });
    });

    describe("Access Control", function () {
        it("Should prevent non-minters from creating NFTs", async function () {
            const futureTime = (await time.latest()) + 3600;
            const metadata = {
                name: "Unauthorized NFT",
                description: "Test",
                image: "ipfs://test",
                mediaType: "image",
                externalUrl: ""
            };

            const expectedError = `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${MINTER_ROLE}`;

            await expect(
                nftContract.connect(addr1).createNFT(
                    await addr2.getAddress(),
                    metadata,
                    "Encrypted content",
                    futureTime,
                    customMessage,
                    true
                )
            ).to.be.revertedWith(expectedError);
        });

        it("Should allow adding and removing minters", async function () {
            const futureTime = (await time.latest()) + 3600;
            const metadata = {
                name: "New Minter NFT",
                description: "Test",
                image: "ipfs://test",
                mediaType: "image",
                externalUrl: ""
            };

            // Grant role to addr1
            await nftContract.grantRole(MINTER_ROLE, await addr1.getAddress());

            // Should succeed now
            await nftContract.connect(addr1).createNFT(
                await addr2.getAddress(),
                metadata,
                "Encrypted content",
                futureTime,
                customMessage,
                true
            );

            // Revoke role
            await nftContract.revokeRole(MINTER_ROLE, await addr1.getAddress());

            // Should fail now
            const expectedError = `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${MINTER_ROLE}`;
            await expect(
                nftContract.connect(addr1).createNFT(
                    await addr2.getAddress(),
                    metadata,
                    "Encrypted content",
                    futureTime + 1,
                    customMessage,
                    true
                )
            ).to.be.revertedWith(expectedError);
        });
    });

    describe("Multiple NFT Transfers", function () {
        it("Should handle multiple transfers between users", async function () {
            const futureTime = (await time.latest()) + 3600;
            const metadata = {
                name: "Transfer Test NFT",
                description: "Test",
                image: "ipfs://test",
                mediaType: "image",
                externalUrl: ""
            };

            // Create multiple NFTs
            for (let i = 0; i < 3; i++) {
                await nftContract.createNFT(
                    await addr1.getAddress(),
                    metadata,
                    "Encrypted content",
                    futureTime,
                    customMessage + i,
                    true
                );
            }

            // Transfer pattern: addr1 -> addr2 -> addr3 -> addr1
            await nftContract.connect(addr1).safeTransferFrom(
                await addr1.getAddress(),
                await addr2.getAddress(),
                1
            );

            await nftContract.connect(addr2).safeTransferFrom(
                await addr2.getAddress(),
                await addr3.getAddress(),
                1
            );

            await nftContract.connect(addr3).safeTransferFrom(
                await addr3.getAddress(),
                await addr1.getAddress(),
                1
            );

            expect(await nftContract.ownerOf(1)).to.equal(await addr1.getAddress());
            expect(await nftContract.balanceOf(await addr1.getAddress())).to.equal(3);
        });

        it("Should prevent unauthorized transfers", async function () {
            const futureTime = (await time.latest()) + 3600;
            const metadata = {
                name: "Auth Test NFT",
                description: "Test",
                image: "ipfs://test",
                mediaType: "image",
                externalUrl: ""
            };

            await nftContract.createNFT(
                await addr1.getAddress(),
                metadata,
                "Encrypted content",
                futureTime,
                customMessage,
                true
            );

            await expect(
                nftContract.connect(addr2).safeTransferFrom(
                    await addr1.getAddress(),
                    await addr3.getAddress(),
                    1
                )
            ).to.be.revertedWith("ERC721: caller is not token owner or approved");
        });
    });
});