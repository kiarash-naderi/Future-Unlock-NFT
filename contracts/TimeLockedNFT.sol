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
 * @dev NFT با قابلیت قفل زمانی و محتوای رمزگذاری شده
 * @notice این قرارداد بهینه‌سازی شده برای جلوگیری از خطای Stack too deep
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
        string name;           // نام NFT
        string description;    // توضیحات
        string image;         // آدرس تصویر
        string mediaType;     // نوع محتوا (تصویر، ویدیو، متن)
        string externalUrl;   // لینک خارجی (اختیاری)
    }

    struct NFTContent {
        string encryptedContent;    // محتوای رمزگذاری شده
        uint256 unlockTime;         // زمان باز شدن قفل
        bool isUnlocked;            // وضعیت قفل
        string customMessage;       // پیام شخصی
        bool isTransferable;        // قابلیت انتقال
        address creator;            // سازنده NFT
    }

    struct LockTimeConfig {
        uint256 lockDays;
        uint256 lockHours;
        uint256 lockMinutes;
        uint256 totalSeconds;
    }

    // NFT های پیش‌فرض
    NFTMetadata[20] private _predefinedNFTs;
    
    // نگاشت tokenId به اطلاعات و محتوا
    mapping(uint256 => NFTMetadata) private _tokenMetadata;
    mapping(uint256 => NFTContent) private _tokenContent;
    mapping(uint256 => LockTimeConfig) private _tokenLockConfig;
    
    // رویدادها
    event NFTCreated(uint256 indexed tokenId, address indexed creator, uint256 unlockTime, string mediaType);
    event NFTUnlocked(uint256 indexed tokenId, address indexed owner);
    event ContentUpdated(uint256 indexed tokenId);
    event UnlockTimeUpdated(uint256 indexed tokenId, uint256 newUnlockTime);

    constructor() ERC721("TimeLockedNFT", "TLNFT") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _initializePredefinedNFTs();
    }

    /**
     * @dev مقداردهی اولیه NFT های پیش‌فرض
     * @notice جدا کردن مقداردهی‌های پیش‌فرض برای بهینه‌سازی گس
     */
    function _initializePredefinedNFTs() private {
        _predefinedNFTs[0] = NFTMetadata("Future Memory #1", "A digital time capsule for your memories", "ipfs://memory1", "memory", "");
        _predefinedNFTs[1] = NFTMetadata("Love Letter #1", "Send a love letter to the future", "ipfs://love1", "letter", "");
        _predefinedNFTs[2] = NFTMetadata("Birthday Surprise #1", "Schedule a birthday surprise", "ipfs://birthday1", "surprise", "");
        _predefinedNFTs[3] = NFTMetadata("Achievement Unlock #1", "Set future goals and celebrate", "ipfs://achievement1", "goal", "");
        _predefinedNFTs[4] = NFTMetadata("Time Crystal #1", "Store your thoughts in time", "ipfs://crystal1", "crystal", "");
        _predefinedNFTs[5] = NFTMetadata("Future Memory #2", "A digital time capsule for your memories", "ipfs://memory2", "memory", "");
        _predefinedNFTs[6] = NFTMetadata("Love Letter #2", "Send a love letter to the future", "ipfs://love2", "letter", "");
        _predefinedNFTs[7] = NFTMetadata("Birthday Surprise #2", "Schedule a birthday surprise", "ipfs://birthday2", "surprise", "");
        _predefinedNFTs[8] = NFTMetadata("Achievement Unlock #2", "Set future goals and celebrate", "ipfs://achievement2", "goal", "");
        _predefinedNFTs[9] = NFTMetadata("Time Crystal #2", "Store your thoughts in time", "ipfs://crystal2", "crystal", "");
        _predefinedNFTs[10] = NFTMetadata("Future Memory #3", "A digital time capsule for your memories", "ipfs://memory3", "memory", "");
        _predefinedNFTs[11] = NFTMetadata("Love Letter #3", "Send a love letter to the future", "ipfs://love3", "letter", "");
        _predefinedNFTs[12] = NFTMetadata("Birthday Surprise #3", "Schedule a birthday surprise", "ipfs://birthday3", "surprise", "");
        _predefinedNFTs[13] = NFTMetadata("Achievement Unlock #3", "Set future goals and celebrate", "ipfs://achievement3", "goal", "");
        _predefinedNFTs[14] = NFTMetadata("Time Crystal #3", "Store your thoughts in time", "ipfs://crystal3", "crystal", "");
        _predefinedNFTs[15] = NFTMetadata("Future Memory #4", "A digital time capsule for your memories", "ipfs://memory4", "memory", "");
        _predefinedNFTs[16] = NFTMetadata("Love Letter #4", "Send a love letter to the future", "ipfs://love4", "letter", "");
        _predefinedNFTs[17] = NFTMetadata("Birthday Surprise #4", "Schedule a birthday surprise", "ipfs://birthday4", "surprise", "");
        _predefinedNFTs[18] = NFTMetadata("Achievement Unlock #4", "Set future goals and celebrate", "ipfs://achievement4", "goal", "");
        _predefinedNFTs[19] = NFTMetadata("Time Crystal #4", "Store your thoughts in time", "ipfs://crystal4", "crystal", "");
    }

    /**
     * @dev دریافت متادیتای پیش‌فرض
     */
    function getPredefinedNFT(uint256 index) public view returns (NFTMetadata memory) {
        require(index < 20, "Invalid index");
        return _predefinedNFTs[index];
    }

    /**
     * @dev ایجاد NFT جدید با قابلیت قفل زمانی
     * @notice بهینه‌سازی شده برای کاهش متغیرهای محلی
     */
    function createNFT(
        address recipient,
        uint256 predefinedIndex,
        string memory encryptedContent,
        uint256 lockDays,
        uint256 lockHours,
        uint256 lockMinutes,
        string memory customMessage,
        bool isTransferable
    ) public onlyRole(MINTER_ROLE) nonReentrant returns (uint256) {
        require(predefinedIndex < 20, "Invalid NFT template index");
        require(recipient != address(0), "Invalid recipient");
        require(bytes(encryptedContent).length > 0, "Content required");

        uint256 totalLockSeconds = Utils.timeToSeconds(lockDays, lockHours, lockMinutes);
        uint256 unlockTime = block.timestamp + totalLockSeconds;
        require(unlockTime > block.timestamp, "Invalid lock time");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Mint NFT
        _safeMint(recipient, newTokenId);
        
        // Store metadata
        NFTMetadata memory metadata = _predefinedNFTs[predefinedIndex];
        _tokenMetadata[newTokenId] = metadata;

        // Store lock configuration
        _tokenLockConfig[newTokenId] = LockTimeConfig({
            lockDays: lockDays,
            lockHours: lockHours,
            lockMinutes: lockMinutes,
            totalSeconds: totalLockSeconds
        });

        // Store content
        _tokenContent[newTokenId] = NFTContent({
            encryptedContent: encryptedContent,
            unlockTime: unlockTime,
            isUnlocked: false,
            customMessage: customMessage,
            isTransferable: isTransferable,
            creator: msg.sender
        });

        // Emit event
        emit NFTCreated(newTokenId, msg.sender, unlockTime, metadata.mediaType);
        return newTokenId;
    }

    /**
     * @dev باز کردن قفل NFT
     */
    function unlockNFT(uint256 tokenId) public returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(!_tokenContent[tokenId].isUnlocked, "Already unlocked");
        require(block.timestamp >= _tokenContent[tokenId].unlockTime, "Still locked");

        _tokenContent[tokenId].isUnlocked = true;
        emit NFTUnlocked(tokenId, msg.sender);
        return true;
    }

    /**
     * @dev دریافت محتوای NFT
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
     * @dev دریافت زمان باقی‌مانده قفل
     */
    function getRemainingLockTime(uint256 tokenId) public view returns (
        uint256 remainingDays,
        uint256 remainingHours,
        uint256 remainingMinutes
    ) {
        require(_exists(tokenId), "Token does not exist");
        NFTContent memory content = _tokenContent[tokenId];
        
        if (content.isUnlocked || block.timestamp >= content.unlockTime) {
            return (0, 0, 0);
        }
        
        return Utils.getRemainingTime(content.unlockTime);
    }

    /**
     * @dev دریافت کانفیگ زمان قفل
     */
    function getLockTimeConfig(uint256 tokenId) public view returns (
        uint256 lockDays,
        uint256 lockHours,
        uint256 lockMinutes,
        uint256 totalSeconds
    ) {
        require(_exists(tokenId), "Token does not exist");
        LockTimeConfig memory config = _tokenLockConfig[tokenId];
        return (
            config.lockDays,
            config.lockHours,
            config.lockMinutes,
            config.totalSeconds
        );
    }

    /**
     * @dev به‌روزرسانی زمان قفل
     */
    function updateUnlockTime(
        uint256 tokenId,
        uint256 newLockDays,
        uint256 newLockHours,
        uint256 newLockMinutes
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        require(!_tokenContent[tokenId].isUnlocked, "Already unlocked");

        uint256 newTotalSeconds = Utils.timeToSeconds(newLockDays, newLockHours, newLockMinutes);
        uint256 newUnlockTime = block.timestamp + newTotalSeconds;
        require(newUnlockTime > block.timestamp, "New time must be future");

        _tokenLockConfig[tokenId] = LockTimeConfig({
            lockDays: newLockDays,
            lockHours: newLockHours,
            lockMinutes: newLockMinutes,
            totalSeconds: newTotalSeconds
        });

        _tokenContent[tokenId].unlockTime = newUnlockTime;
        emit UnlockTimeUpdated(tokenId, newUnlockTime);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        if (from != address(0)) { // Skip check for minting
            NFTContent memory content = _tokenContent[tokenId];
            require(
                content.isTransferable && content.isUnlocked || to == address(0),
                "Token not transferable"
            );
        }
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