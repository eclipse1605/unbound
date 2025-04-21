// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IMediaManager
 * @dev Interface for the MediaManager contract
 */

interface IMediaManager {
    /**
     * @dev Initializes the contract
     * @param coordinator Address of the coordinator
     */
    function initialize(address coordinator) external;
    
    /**
     * @dev Registers media on IPFS
     * @param ipfsHash IPFS hash of the media
     * @param contentType Type of media content
     * @return Success status
     */
    function registerMedia(string memory ipfsHash, string memory contentType) external returns (bool);
    
    /**
     * @dev Deactivates media
     * @param ipfsHash IPFS hash of the media to deactivate
     * @return Success status
     */
    function deactivateMedia(string memory ipfsHash) external returns (bool);
    
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
    );
    
    /**
     * @dev Gets all media owned by a user
     * @param user Address of the user
     * @return Array of IPFS hashes
     */
    function getUserMedia(address user) external view returns (string[] memory);
}