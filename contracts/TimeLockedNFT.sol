// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./libraries/Utils.sol";

/**
 * @title TimeLockedNFT
 * @dev NFT with time lock capability and encrypted content
 */
contract TimeLockedNFT is 
    ERC721, 
    ERC721URIStorage, 
    ERC721Enumerable, 
    ReentrancyGuard, 
    AccessControl 
{
    using Utils for uint256;
    using Counters for Counters.Counter;
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    Counters.Counter private _tokenIds;

    struct NFTMetadata {
        string name;           // NFT name
        string description;    // Description
        string image;          // Image URL
        string mediaType;      // Content type (image, video, text)
        string externalUrl;    // External link (optional)
    }

    struct NFTContent {
        string encryptedContent;    // Encrypted content
        uint256 unlockTime;         // Unlock time
        bool isUnlocked;            // Lock status
        string customMessage;       // Custom message
        bool isTransferable;        // Transferability
        address creator;            // NFT creator
    }

    // Predefined NFTs
    NFTMetadata[20] public predefinedNFTs;
    
    // Mapping tokenId to metadata and content
    mapping(uint256 => NFTMetadata) private _tokenMetadata;
    mapping(uint256 => NFTContent) private _tokenContent;
    
    // Events
    event NFTCreated(
        uint256 indexed tokenId,
        address indexed creator,
        uint256 unlockTime,
        string mediaType
    );
    event NFTUnlocked(uint256 indexed tokenId, address indexed owner);
    event ContentUpdated(uint256 indexed tokenId);
    event UnlockTimeUpdated(uint256 indexed tokenId, uint256 newUnlockTime);

    constructor() ERC721("TimeLockedNFT", "TLNFT") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        
        // Define predefined NFTs
        predefinedNFTs[0] = NFTMetadata("Future Memory #1", "A digital time capsule for your memories", "ipfs://memory1", "memory", "");
        predefinedNFTs[1] = NFTMetadata("Love Letter #1", "Send a love letter to the future", "ipfs://love1", "letter", "");
        predefinedNFTs[2] = NFTMetadata("Birthday Surprise #1", "Schedule a birthday surprise", "ipfs://birthday1", "surprise", "");
        predefinedNFTs[3] = NFTMetadata("Achievement Unlock #1", "Set future goals and celebrate", "ipfs://achievement1", "goal", "");
        predefinedNFTs[4] = NFTMetadata("Time Crystal #1", "Store your thoughts in time", "ipfs://crystal1", "crystal", "");
        // ... continue defining NFTs 5 to 19
    }

    /**
     * @dev Create a new NFT
     * @param recipient Recipient address
     * @param predefinedIndex Index of predefined NFT
     * @param encryptedContent Encrypted content
     * @param unlockTime Unlock time
     * @param customMessage Custom message
     * @param isTransferable Transferability
     */
    function createNFT(
        address recipient,
        uint256 predefinedIndex,
        string memory encryptedContent,
        uint256 unlockTime,
        string memory customMessage,
        bool isTransferable
    ) public onlyRole(MINTER_ROLE) nonReentrant returns (uint256) {
        require(predefinedIndex < 20, "Invalid NFT template index");
        require(unlockTime > block.timestamp, "Unlock time must be future");
        require(bytes(encryptedContent).length > 0, "Content required");
        require(recipient != address(0), "Invalid recipient");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(recipient, newTokenId);
        
        // Use the selected predefined NFT
        _tokenMetadata[newTokenId] = predefinedNFTs[predefinedIndex];
        
        _tokenContent[newTokenId] = NFTContent({
            encryptedContent: encryptedContent,
            unlockTime: unlockTime,
            isUnlocked: false,
            customMessage: customMessage,
            isTransferable: isTransferable,
            creator: msg.sender
        });

        emit NFTCreated(newTokenId, msg.sender, unlockTime, predefinedNFTs[predefinedIndex].mediaType);
        return newTokenId;
    }

    /**
     * @dev Unlock the NFT
     */
    function unlockNFT(uint256 tokenId) public nonReentrant returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(!_tokenContent[tokenId].isUnlocked, "Already unlocked");
        require(block.timestamp >= _tokenContent[tokenId].unlockTime, "Still locked");

        _tokenContent[tokenId].isUnlocked = true;
        emit NFTUnlocked(tokenId, msg.sender);
        
        return true;
    }

    /**
     * @dev Get NFT content
     */
    function getNFTContent(uint256 tokenId) public view returns (
        string memory content,
        string memory message,
        bool isUnlocked
    ) {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        
        NFTContent memory nftContent = _tokenContent[tokenId];
        
        if (!nftContent.isUnlocked && block.timestamp < nftContent.unlockTime) {
            return ("", nftContent.customMessage, false);
        }
        
        return (
            nftContent.encryptedContent,
            nftContent.customMessage,
            nftContent.isUnlocked
        );
    }

    /**
     * @dev Update unlock time
     */
    function updateUnlockTime(uint256 tokenId, uint256 newUnlockTime) 
        public 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_exists(tokenId), "Token does not exist");
        require(newUnlockTime > block.timestamp, "New time must be future");
        require(!_tokenContent[tokenId].isUnlocked, "Already unlocked");

        _tokenContent[tokenId].unlockTime = newUnlockTime;
        emit UnlockTimeUpdated(tokenId, newUnlockTime);
    }

    // Overridden functions for compatibility with standards
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        require(
            _tokenContent[tokenId].isTransferable || 
            from == address(0) || 
            to == address(0),
            "Token not transferable"
        );
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(
        ERC721,
        ERC721Enumerable,
        ERC721URIStorage,
        AccessControl
    ) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view override(
        ERC721,
        ERC721URIStorage
    ) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}