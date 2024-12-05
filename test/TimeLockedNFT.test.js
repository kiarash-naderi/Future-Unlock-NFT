const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("TimeLockedNFT Contract", function () {
    let TimeLockedNFT, nftContract;
    let owner, addr1, addr2, addr3;
    let MINTER_ROLE, ADMIN_ROLE;

    beforeEach(async function () {
        TimeLockedNFT = await ethers.getContractFactory("TimeLockedNFT");
        nftContract = await TimeLockedNFT.deploy();
        await nftContract.waitForDeployment();

        [owner, addr1, addr2, addr3] = await ethers.getSigners();
        
        MINTER_ROLE = await nftContract.MINTER_ROLE();
        ADMIN_ROLE = await nftContract.ADMIN_ROLE();
    });

    async function mintNFTAndGetTokenId(recipient, isTransferable = true) {
        const tx = await nftContract.mintNFT(
            recipient,
            "Encrypted Test Content",
            1, // lockDays
            0, // lockHours
            0, // lockMinutes
            1, // templateId
            "ipfs://test",
            "Test NFT",
            "Test Description",
            "text",
            isTransferable,
            true // isEncrypted
        );
        const receipt = await tx.wait();
        
        // Find NFTMinted event and extract tokenId
        const nftMintedEvent = receipt.logs.find(
            log => {
                try {
                    const parsed = nftContract.interface.parseLog({
                        topics: log.topics,
                        data: log.data
                    });
                    return parsed.name === "NFTMinted";
                } catch (e) {
                    return false;
                }
            }
        );
        
        if (!nftMintedEvent) {
            throw new Error("NFTMinted event not found");
        }

        const parsedLog = nftContract.interface.parseLog({
            topics: nftMintedEvent.topics,
            data: nftMintedEvent.data
        });

        return parsedLog.args[0]; // tokenId is the first argument
    }

    describe("Deployment & Roles", function () {
        it("Should set correct roles for owner", async function () {
            expect(await nftContract.hasRole(MINTER_ROLE, owner.address)).to.be.true;
            expect(await nftContract.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
        });
    });

    describe("NFT Minting", function () {
        it("Should mint NFT with correct parameters", async function () {
            await expect(nftContract.mintNFT(
                addr1.address,
                "Encrypted Test Content",
                1, // lockDays
                0, // lockHours
                0, // lockMinutes
                1, // templateId
                "ipfs://test", // metadataURI
                "Test NFT", // title
                "Test Description", // description 
                "text", // mediaType
                true, // isTransferable
                true // isEncrypted
            )).to.emit(nftContract, "NFTMinted")
              .withArgs(1, owner.address, anyValue, 1, "text");
        });

        it("Should reject mint with zero lock time", async function () {
            await expect(nftContract.mintNFT(
                addr1.address,
                "Encrypted Test Content",
                0, // lockDays 
                0, // lockHours
                0, // lockMinutes
                1,
                "ipfs://test",
                "Test NFT",
                "Test Description",
                "text",
                true,
                true
            )).to.be.revertedWith("Lock time required");
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
});