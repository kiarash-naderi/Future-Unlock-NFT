// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Enhanced TimeLockedNFT
 * @dev Advanced NFT contract with precise time-lock mechanism and comprehensive metadata management
 * @notice This contract supports days, hours, and minutes for time locks
 */
contract TimeLockedNFT is 
    ERC721, 
    ERC721URIStorage, 
    ERC721Enumerable, 
    ReentrancyGuard,
    Pausable,
    AccessControl 
{
    using Counters for Counters.Counter;
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    Counters.Counter private _tokenIdCounter;

    uint256 private constant SECONDS_PER_MINUTE = 60;
    uint256 private constant SECONDS_PER_HOUR = 3600;
    uint256 private constant SECONDS_PER_DAY = 86400;
    
    struct NFTMetadata {
        string content;          // Encrypted content/message
        string title;           // NFT title
        string description;     // NFT description
        string metadataURI;     // IPFS metadata URI
        uint256 templateId;     // Frontend template reference
        string mediaType;       // Type of content
    }

    struct NFTStatus {
        bool isUnlocked;        // Lock status
        bool isTransferable;    // Transfer permission
        address creator;        // NFT creator
        uint256 createdAt;      // Creation timestamp
        bool isEncrypted;       // Content encryption status
        uint256 unlockTimestamp; // When NFT will be unlocked
    }

    // Core Storage
    mapping(uint256 => NFTMetadata) private _metadata;
    mapping(uint256 => NFTStatus) private _status;
    mapping(uint256 => bool) private _validTemplateIds;
    mapping(address => uint256[]) private _userNFTs;
    
    // Events
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        uint256 unlockTime,
        uint256 templateId,
        string mediaType
    );
    event NFTUnlocked(uint256 indexed tokenId, address indexed owner);
    event MetadataUpdated(uint256 indexed tokenId, string newURI);
    event ContentUpdated(uint256 indexed tokenId);
    event TransferabilityUpdated(uint256 indexed tokenId, bool isTransferable);

    constructor() ERC721("TimeLockedNFT", "TLNFT") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        
        // Initialize valid template IDs (0-19)
        for(uint256 i = 0; i < 20; i++) {
            _validTemplateIds[i] = true;
        }
    }

    // Adding a new struct for mint parameters
    struct MintParams {
        address recipient;
        string content;
        uint256 lockDays;
        uint256 lockHours;
        uint256 lockMinutes;
        uint256 templateId;
        string metadataURI;
        string title;
        string description;
        string mediaType;
        bool isTransferable;
        bool isEncrypted;
    }

    /**
     * @dev Creates a new time-locked NFT with precise lock duration
     * @param params The MintParams struct containing all parameters:
     *        - recipient: The address of the recipient
     *        - content: The content of the NFT
     *        - lockDays: The number of days the NFT is locked
     *        - lockHours: The number of hours the NFT is locked
     *        - lockMinutes: The number of minutes the NFT is locked
     *        - templateId: The ID of the template used for the NFT
     *        - metadataURI: The URI for the NFT metadata
     *        - title: The title of the NFT
     *        - description: The description of the NFT
     *        - mediaType: The media type of the NFT
     *        - isTransferable: Whether the NFT is transferable
     *        - isEncrypted: Whether the NFT content is encrypted
     * @return uint256 The ID of the minted NFT
     */
    function mintNFT(MintParams memory params) 
        external
        whenNotPaused
        nonReentrant
        returns (uint256)
    {
        require(params.recipient != address(0), "Invalid recipient");
        require(bytes(params.content).length > 0, "Content required");
        require(_validTemplateIds[params.templateId], "Invalid template");
        require(params.lockDays > 0 || params.lockHours > 0 || params.lockMinutes > 0, "Lock time required");

        uint256 unlockTimestamp = block.timestamp + 
            (params.lockDays * SECONDS_PER_DAY) +
            (params.lockHours * SECONDS_PER_HOUR) +
            (params.lockMinutes * SECONDS_PER_MINUTE);
        
        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();
        
        // Store metadata
        _metadata[newTokenId] = NFTMetadata({
            content: params.content,
            title: params.title,
            description: params.description,
            metadataURI: params.metadataURI,
            templateId: params.templateId,
            mediaType: params.mediaType
        });

        // Store status
        _status[newTokenId] = NFTStatus({
            isUnlocked: false,
            isTransferable: params.isTransferable,
            creator: msg.sender,
            createdAt: block.timestamp,
            isEncrypted: params.isEncrypted,
            unlockTimestamp: unlockTimestamp
        });

        _safeMint(params.recipient, newTokenId);
        _setTokenURI(newTokenId, params.metadataURI);
        _setUserNFT(params.recipient, newTokenId);

        emit NFTMinted(newTokenId, msg.sender, unlockTimestamp, params.templateId, params.mediaType);
        return newTokenId;
    }

    /**
     * @dev Unlocks NFT if time has passed
     */
    function unlock(uint256 tokenId) external whenNotPaused {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        
        NFTStatus storage status = _status[tokenId];

        require(!status.isUnlocked, "Already unlocked");
        require(block.timestamp >= status.unlockTimestamp, "Still locked");

        status.isUnlocked = true;

        string memory newURI = _updateTokenURI(tokenId);
        _setTokenURI(tokenId, newURI);

        emit NFTUnlocked(tokenId, msg.sender);
    }

    /**
     * @dev Gets complete NFT data
     */
    function getNFTData(uint256 tokenId) external view returns (
        string memory content,
        string memory title,
        string memory description,
        bool isUnlocked,
        uint256 unlockTimestamp,
        address creator,
        uint256 templateId,
        string memory mediaType,
        bool isTransferable,
        bool isEncrypted
    ) {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        
        NFTMetadata memory meta = _metadata[tokenId];
        NFTStatus memory status = _status[tokenId];
        
        return (
            status.isUnlocked ? meta.content : "",
            meta.title,
            meta.description,
            status.isUnlocked,
            status.unlockTimestamp,
            status.creator,
            meta.templateId,
            meta.mediaType,
            status.isTransferable,
            status.isEncrypted
        );
    }

    /**
     * @dev Gets remaining lock time components
     */
    function getRemainingTime(uint256 tokenId) external view returns (
        uint256 lockDays,
        uint256 lockHours,
        uint256 lockMinutes,
        uint256 totalSeconds
    ) {
        require(_exists(tokenId), "Token does not exist");
        NFTStatus memory status = _status[tokenId];
        
        if (status.isUnlocked || block.timestamp >= status.unlockTimestamp) {
            return (0, 0, 0, 0);
        }
        
        uint256 remaining = status.unlockTimestamp - block.timestamp;
        lockDays = remaining / SECONDS_PER_DAY;
        remaining = remaining % SECONDS_PER_DAY;
        lockHours = remaining / SECONDS_PER_HOUR;
        remaining = remaining % SECONDS_PER_HOUR;
        lockMinutes = remaining / SECONDS_PER_MINUTE;
        
        return (lockDays, lockHours, lockMinutes, remaining);
    }

    /**
     * @dev Gets all NFTs owned by an address
     */
    function getUserNFTs(address user) external view returns (uint256[] memory) {
        return _userNFTs[user];
    }

    // Admin functions

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function setTransferability(uint256 tokenId, bool isTransferable) external onlyRole(ADMIN_ROLE) {
        _status[tokenId].isTransferable = isTransferable;
        emit TransferabilityUpdated(tokenId, isTransferable);
    }

    // Required overrides

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        if (from != address(0)) {
            NFTStatus memory status = _status[tokenId];
            require(
                status.isTransferable && status.isUnlocked || to == address(0) || hasRole(ADMIN_ROLE, msg.sender),
                "Token not transferable"
            );
        }
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(
        ERC721,
        ERC721URIStorage
    ) returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        NFTStatus memory status = _status[tokenId];
        NFTMetadata memory meta = _metadata[tokenId];
        
        // If the NFT is not yet unlocked
        if (!status.isUnlocked) {
            return meta.metadataURI;
        }
        
        // If unlocked, add the main message to the metadata
        NFTMetadata memory updatedMeta = NFTMetadata({
            content: meta.content,
            title: "TimeLockedNFT - Unlocked",
            description: meta.content, // Main message as description
            metadataURI: meta.metadataURI,
            templateId: meta.templateId,
            mediaType: meta.mediaType
        });
        
        return updatedMeta.metadataURI;
    }

    function supportsInterface(bytes4 interfaceId) public view override(
        ERC721,
        ERC721Enumerable,
        ERC721URIStorage,
        AccessControl
    ) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _setUserNFT(address user, uint256 tokenId) internal {
        _userNFTs[user].push(tokenId);
    }

    // Adding a new function to retrieve content
    function getNFTContent(uint256 tokenId) external view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        NFTStatus memory status = _status[tokenId];
        require(status.isUnlocked, "NFT is still locked");
        
        return _metadata[tokenId].content;
    }

    // Adding this new function to the contract
    function _updateTokenURI(uint256 tokenId) internal view returns (string memory) {
        string memory currentURI = tokenURI(tokenId);
        return currentURI; 
    }

}
