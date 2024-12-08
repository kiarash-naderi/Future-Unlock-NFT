const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("TimeLockedNFT Contract", function () {
    let TimeLockedNFT, nftContract;
    let owner, addr1, addr2, addr3;
    let ADMIN_ROLE;

    beforeEach(async function () {
        TimeLockedNFT = await ethers.getContractFactory("TimeLockedNFT");
        nftContract = await TimeLockedNFT.deploy();
        await nftContract.waitForDeployment();

        [owner, addr1, addr2, addr3] = await ethers.getSigners();
        
        ADMIN_ROLE = await nftContract.ADMIN_ROLE();
    });

    async function mintNFTAndGetTokenId(recipient, isTransferable = true, minter = addr1) {
        const mintParams = {
            recipient: recipient,
            content: "Encrypted Test Content",
            lockDays: 1,
            lockHours: 0,
            lockMinutes: 0,
            templateId: 1,
            metadataURI: "ipfs://test",
            title: "Test NFT",
            description: "Test Description",
            mediaType: "text",
            isTransferable: isTransferable,
            isEncrypted: true
        };

        const tx = await nftContract.connect(minter).mintNFT(mintParams);
        const receipt = await tx.wait();
        
        const event = receipt.logs[0];
        const parsedEvent = nftContract.interface.parseLog({
            topics: event.topics,
            data: event.data
        });
        
        return parsedEvent.args.tokenId;
    }

    describe("NFT Minting", function () {
        it("Should mint NFT with correct parameters", async function () {
            const mintParams = {
                recipient: addr1.address,
                content: "Encrypted Test Content",
                lockDays: 1,
                lockHours: 0,
                lockMinutes: 0,
                templateId: 1,
                metadataURI: "ipfs://test",
                title: "Test NFT",
                description: "Test Description",
                mediaType: "text",
                isTransferable: true,
                isEncrypted: true
            };

            await expect(nftContract.mintNFT(mintParams))
                .to.emit(nftContract, "NFTMinted")
                .withArgs(anyValue, owner.address, anyValue, 1, "text");
        });

        it("Should reject mint with zero lock time", async function () {
            const mintParams = {
                recipient: addr1.address,
                content: "Encrypted Test Content",
                lockDays: 0,
                lockHours: 0,
                lockMinutes: 0,
                templateId: 1,
                metadataURI: "ipfs://test",
                title: "Test NFT",
                description: "Test Description",
                mediaType: "text",
                isTransferable: true,
                isEncrypted: true
            };

            await expect(nftContract.mintNFT(mintParams))
                .to.be.revertedWith("Lock time required");
        });

        it("Should allow any address to mint NFT", async function () {
            const mintParams = {
                recipient: addr2.address,
                content: "Test Content",
                lockDays: 1,
                lockHours: 0,
                lockMinutes: 0,
                templateId: 1,
                metadataURI: "ipfs://test",
                title: "Test NFT",
                description: "Test Description",
                mediaType: "text",
                isTransferable: true,
                isEncrypted: true
            };

            // Non-owner should be able to mint
            await expect(nftContract.connect(addr1).mintNFT(mintParams))
                .to.emit(nftContract, "NFTMinted")
                .withArgs(anyValue, addr1.address, anyValue, 1, "text");
        });
    });

    describe("Time Lock Mechanics", function () {
        let tokenId;

        beforeEach(async function () {
            tokenId = await mintNFTAndGetTokenId(addr1.address);
        });

        it("Should not unlock before time", async function () {
            await expect(nftContract.connect(addr1).unlock(tokenId))
                .to.be.revertedWith("Still locked");
        });

        it("Should unlock after time passes", async function () {
            await time.increase(time.duration.days(1));
            await expect(nftContract.connect(addr1).unlock(tokenId))
                .to.emit(nftContract, "NFTUnlocked")
                .withArgs(tokenId, addr1.address);
        });
    });

    describe("Content Access", function () {
        let tokenId;

        beforeEach(async function () {
            tokenId = await mintNFTAndGetTokenId(addr1.address);
        });

        it("Should not reveal content before unlock", async function () {
            const data = await nftContract.connect(addr1).getNFTData(tokenId);
            expect(data[0]).to.equal("");
        });

        it("Should reveal content after unlock", async function () {
            await time.increase(time.duration.days(1));
            await nftContract.connect(addr1).unlock(tokenId);
            const data = await nftContract.connect(addr1).getNFTData(tokenId);
            expect(data[0]).to.equal("Encrypted Test Content");
        });
    });

    describe("Transfer Restrictions", function () {
        let tokenId;

        beforeEach(async function () {
            tokenId = await mintNFTAndGetTokenId(addr1.address, false);
        });

        it("Should prevent transfer when locked", async function () {
            await expect(
                nftContract.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId)
            ).to.be.revertedWith("Token not transferable");
        });
    });

    describe("Admin Functions", function () {
        it("Should allow admin to pause contract", async function () {
            await nftContract.pause();
            expect(await nftContract.paused()).to.be.true;
        });

        it("Should allow admin to unpause contract", async function () {
            await nftContract.pause();
            await nftContract.unpause();
            expect(await nftContract.paused()).to.be.false;
        });
    });

    describe("Edge Cases and Special Scenarios", function () {
        let tokenId;

        describe("Lock Time Variations", function () {
            it("Should handle maximum lock time correctly", async function () {
                const mintParams = {
                    recipient: addr1.address,
                    content: "Max Lock Content",
                    lockDays: 365,
                    lockHours: 23,
                    lockMinutes: 59,
                    templateId: 1,
                    metadataURI: "ipfs://test",
                    title: "Test NFT",
                    description: "Test Description",
                    mediaType: "text",
                    isTransferable: true,
                    isEncrypted: true
                };
                
                await expect(nftContract.mintNFT(mintParams))
                    .to.emit(nftContract, "NFTMinted");
            });

            it("Should handle minimum valid lock time", async function () {
                const mintParams = {
                    recipient: addr1.address,
                    content: "Min Lock Content",
                    lockDays: 0,
                    lockHours: 0,
                    lockMinutes: 1,
                    templateId: 1,
                    metadataURI: "ipfs://test",
                    title: "Test NFT",
                    description: "Test Description",
                    mediaType: "text",
                    isTransferable: true,
                    isEncrypted: true
                };
                
                await expect(nftContract.mintNFT(mintParams))
                    .to.emit(nftContract, "NFTMinted");
            });
        });

        describe("Metadata Handling", function () {
            beforeEach(async function () {
                tokenId = await mintNFTAndGetTokenId(addr1.address);
            });

            it("Should return correct metadata URI before unlock", async function () {
                const uri = await nftContract.tokenURI(tokenId);
                expect(uri).to.equal("ipfs://test");
            });

            it("Should handle empty description correctly", async function () {
                const mintParams = {
                    recipient: addr1.address,
                    content: "Test Content",
                    lockDays: 1,
                    lockHours: 0,
                    lockMinutes: 0,
                    templateId: 1,
                    metadataURI: "ipfs://test",
                    title: "Test NFT",
                    description: "",  // empty description
                    mediaType: "text",
                    isTransferable: true,
                    isEncrypted: true
                };

                await expect(nftContract.mintNFT(mintParams))
                    .to.emit(nftContract, "NFTMinted");
            });
        });

        describe("Multiple Operations", function () {
            it("Should handle multiple mints to same address", async function () {
                const firstTokenId = await mintNFTAndGetTokenId(addr1.address);
                const secondTokenId = await mintNFTAndGetTokenId(addr1.address);
                
                expect(firstTokenId).to.not.equal(secondTokenId);
                expect(await nftContract.ownerOf(firstTokenId)).to.equal(addr1.address);
                expect(await nftContract.ownerOf(secondTokenId)).to.equal(addr1.address);
            });

            it("Should handle concurrent unlock attempts", async function () {
                const tokenId = await mintNFTAndGetTokenId(addr1.address);
                await time.increase(time.duration.days(1));
                
                // First unlock should succeed
                await expect(nftContract.connect(addr1).unlock(tokenId))
                    .to.emit(nftContract, "NFTUnlocked");
                
                // Second unlock should fail
                await expect(nftContract.connect(addr1).unlock(tokenId))
                    .to.be.revertedWith("Already unlocked");
            });
        });

        describe("Paused Contract Behavior", function () {
            it("Should prevent minting when paused", async function () {
                await nftContract.pause();
                
                const mintParams = {
                    recipient: addr1.address,
                    content: "Test Content",
                    lockDays: 1,
                    lockHours: 0,
                    lockMinutes: 0,
                    templateId: 1,
                    metadataURI: "ipfs://test",
                    title: "Test NFT",
                    description: "Test Description",
                    mediaType: "text",
                    isTransferable: true,
                    isEncrypted: true
                };

                await expect(nftContract.mintNFT(mintParams))
                    .to.be.revertedWith("Pausable: paused");
            });

            it("Should prevent unlocking when paused", async function () {
                const tokenId = await mintNFTAndGetTokenId(addr1.address);
                await time.increase(time.duration.days(1));
                
                await nftContract.pause();
                await expect(nftContract.connect(addr1).unlock(tokenId))
                    .to.be.revertedWith("Pausable: paused");
            });
        });

        // Add new test section for User NFT Management
        describe("User NFT Management", function () {
            it("Should track user NFTs correctly", async function () {
                // Mint multiple NFTs to the same user
                const firstTokenId = await mintNFTAndGetTokenId(addr1.address);
                const secondTokenId = await mintNFTAndGetTokenId(addr1.address);
                
                const userNFTs = await nftContract.getUserNFTs(addr1.address);
                expect(userNFTs).to.have.length(2);
                expect(userNFTs[0]).to.equal(firstTokenId);
                expect(userNFTs[1]).to.equal(secondTokenId);
            });

            it("Should return empty array for user with no NFTs", async function () {
                const userNFTs = await nftContract.getUserNFTs(addr2.address);
                expect(userNFTs).to.have.length(0);
            });
        });

        // Add new test section for NFT Content Access
        describe("NFT Content Access", function () {
            let tokenId;

            beforeEach(async function () {
                tokenId = await mintNFTAndGetTokenId(addr1.address);
            });

            it("Should not allow content access before unlock", async function () {
                await expect(
                    nftContract.connect(addr1).getNFTContent(tokenId)
                ).to.be.revertedWith("NFT is still locked");
            });

            it("Should allow content access after unlock", async function () {
                await time.increase(time.duration.days(1));
                await nftContract.connect(addr1).unlock(tokenId);
                
                const content = await nftContract.connect(addr1).getNFTContent(tokenId);
                expect(content).to.equal("Encrypted Test Content");
            });

            it("Should not allow non-owner to access content", async function () {
                await time.increase(time.duration.days(1));
                await nftContract.connect(addr1).unlock(tokenId);
                
                await expect(
                    nftContract.connect(addr2).getNFTContent(tokenId)
                ).to.be.revertedWith("Not token owner");
            });
        });

        // Adding tests for remaining time tracking
        describe("Remaining Time Tracking", function () {
            it("Should calculate remaining time correctly", async function () {
                const tokenId = await mintNFTAndGetTokenId(addr1.address);
                const remainingTime = await nftContract.getRemainingTime(tokenId);
                
                expect(remainingTime.lockDays).to.equal(1);
                expect(remainingTime.lockHours).to.equal(0);
                expect(remainingTime.lockMinutes).to.equal(0);
            });

            it("Should return zero time after unlock", async function () {
                const tokenId = await mintNFTAndGetTokenId(addr1.address);
                
                await time.increase(time.duration.days(1));
                await nftContract.connect(addr1).unlock(tokenId);
                
                const remainingTime = await nftContract.getRemainingTime(tokenId);
                expect(remainingTime.lockDays).to.equal(0);
                expect(remainingTime.lockHours).to.equal(0);
                expect(remainingTime.lockMinutes).to.equal(0);
            });
        });

        // Adding tests for invalid template IDs
        describe("Template Validation", function () {
            it("Should reject invalid template ID", async function () {
                const mintParams = {
                    recipient: addr1.address,
                    content: "Test Content",
                    lockDays: 1,
                    lockHours: 0,
                    lockMinutes: 0,
                    templateId: 20, // invalid template ID
                    metadataURI: "ipfs://test",
                    title: "Test NFT",
                    description: "Test Description",
                    mediaType: "text",
                    isTransferable: true,
                    isEncrypted: true
                };

                await expect(nftContract.mintNFT(mintParams))
                    .to.be.revertedWith("Invalid template");
            });
        });
    });
});