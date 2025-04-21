// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IMediaManager.sol";
import "./libraries/UnboundUtils.sol";
import "./libraries/IPFS.sol";

/**
 * @title MediaManager
 * @dev Contract for managing media uploads and retrieval
 */
contract MediaManager is IMediaManager {
    using UnboundUtils for address;
    using IPFS for string;
    
    // Media data structure
    struct Media {
        address owner;
        string contentType;
        string ipfsHash;
        uint256 timestamp;
        bool isActive;
    }
    
    // Main storage
    mapping(string => Media) private _mediaRegistry;
    mapping(address => string[]) private _userMedia;
    
    address private _coordinator;
    bool private _initialized;
    
    event MediaRegistered(string ipfsHash, address indexed owner, string contentType);
    event MediaDeactivated(string ipfsHash, address indexed owner);
    
    modifier onlyCoordinator() {
        if (msg.sender != _coordinator) revert("Unauthorized");
        _;
    }
    
    /**
     * @dev Constructor
     */
    constructor() {
        _coordinator = msg.sender;
    }
    
    /**
     * @dev Initializes the contract
     * @param coordinator Address of the coordinator
     */
    function initialize(address coordinator) external {
        UnboundUtils.validateComponentInitialization(_initialized);
        UnboundUtils.validateAddress(coordinator);
        
        _coordinator = coordinator;
        _initialized = true;
    }
    
    /**
     * @dev Registers media on IPFS
     * @param ipfsHash IPFS hash of the media
     * @param contentType Type of media content
     */
    function registerMedia(string memory ipfsHash, string memory contentType) external returns (bool) {
        ipfsHash.validateIPFSHash();
        
        if (bytes(_mediaRegistry[ipfsHash].ipfsHash).length != 0) {
            return false; // Already registered
        }
        
        _mediaRegistry[ipfsHash] = Media({
            owner: msg.sender,
            contentType: contentType,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            isActive: true
        });
        
        _userMedia[msg.sender].push(ipfsHash);
        
        emit MediaRegistered(ipfsHash, msg.sender, contentType);
        return true;
    }
    
    /**
     * @dev Deactivates media
     * @param ipfsHash IPFS hash of the media to deactivate
     */
    function deactivateMedia(string memory ipfsHash) external returns (bool) {
        Media storage media = _mediaRegistry[ipfsHash];
        
        if (media.owner != msg.sender) {
            return false; // Not owner
        }
        
        media.isActive = false;
        
        emit MediaDeactivated(ipfsHash, msg.sender);
        return true;
    }
    
    /**
     * @dev Gets media details
     * @param ipfsHash IPFS hash of the media
     * @return owner The owner of the media
     * @return contentType The content type of the media
     * @return timestamp The timestamp when the media was registered
     * @return isActive Whether the media is active
     */
    function getMediaDetails(string memory ipfsHash) external view returns (
        address owner,
        string memory contentType,
        uint256 timestamp,
        bool isActive
    ) {
        Media storage media = _mediaRegistry[ipfsHash];
        return (
            media.owner,
            media.contentType,
            media.timestamp,
            media.isActive
        );
    }
    
    /**
     * @dev Gets all media owned by a user
     * @param user Address of the user
     * @return Array of IPFS hashes
     */
    function getUserMedia(address user) external view returns (string[] memory) {
        return _userMedia[user];
    }
}