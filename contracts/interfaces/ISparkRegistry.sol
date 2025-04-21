// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ISparkRegistry
 * @dev Interface for the SparkRegistry contract which manages sparks (posts)
 */
interface ISparkRegistry {
    /**
     * @dev Struct to represent a spark
     */
    struct Spark {
        address author;
        string content;
        string mediaHash; // IPFS hash for media content
        uint256 timestamp;
        uint256 likes;
        uint256 rebounds;
        bool isDeleted;
    }

    /**
     * @dev Event emitted when a new spark is created
     */
    event SparkCreated(uint256 indexed sparkId, address indexed author, string content, string mediaHash);
    event SparkDeleted(uint256 indexed sparkId, address indexed author);
    event SparkLiked(uint256 indexed sparkId, address indexed liker);
    event SparkUnliked(uint256 indexed sparkId, address indexed unliker);

    /**
     * @dev Creates a new spark
     * @param content Content of the spark
     * @param mediaHash IPFS hash for media content
     * @return The ID of the newly created spark
     */
    function createSpark(string memory content, string memory mediaHash) external returns (uint256);

    /**
     * @dev Deletes a spark
     * @param sparkId ID of the spark to delete
     */
    function deleteSpark(uint256 sparkId) external;

    /**
     * @dev Gets a spark by ID
     * @param sparkId ID of the spark to get
     * @return The Spark struct with the requested ID
     */
    function getSpark(uint256 sparkId) external view returns (Spark memory);

    /**
     * @dev Gets all sparks by a specific author
     * @param author Address of the author
     * @return Array of IDs of sparks created by the author
     */
    function getSparksByAuthor(address author) external view returns (uint256[] memory);

    /**
     * @dev Gets the total number of sparks
     * @return The total number of sparks
     */
    function getSparkCount() external view returns (uint256);
} 