// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Error definition
error Unauthorized();

/**
 * @title TestSparkRegistry
 * @dev Standalone version of SparkRegistry for testing
 */
contract TestSparkRegistry {
    // Spark struct to store post data
    struct Spark {
        address author;
        string content;
        string mediaHash;
        uint256 timestamp;
        uint256 likes;
        uint256 rebounds;
        bool isDeleted;
    }

    // Storage
    mapping(uint256 => Spark) private _sparks;
    mapping(address => uint256[]) private _userSparks;
    mapping(uint256 => mapping(address => bool)) private _likes;
    
    uint256 private _sparkCount;
    address private _coordinator;
    bool private _initialized;

    // Events
    event SparkCreated(uint256 indexed sparkId, address indexed author, string content, string mediaHash);
    event SparkDeleted(uint256 indexed sparkId, address indexed author);
    event SparkLiked(uint256 indexed sparkId, address indexed liker);
    event SparkUnliked(uint256 indexed sparkId, address indexed unliker);

    constructor() {
        _coordinator = msg.sender;
    }

    modifier onlyCoordinator() {
        if (msg.sender != _coordinator) revert Unauthorized();
        _;
    }

    /**
     * @dev Creates a new spark
     * @param content Content of the spark
     * @param mediaHash Media hash of the spark (IPFS)
     * @return The ID of the newly created spark
     */
    function createSpark(string memory content, string memory mediaHash) external returns (uint256) {
        // Simple validation to ensure content is not empty
        bytes memory contentBytes = bytes(content);
        require(contentBytes.length > 0 && contentBytes.length <= 280, "Content must be between 1-280 chars");
        
        uint256 sparkId = _sparkCount++;
        _sparks[sparkId] = Spark({
            author: msg.sender,
            content: content,
            mediaHash: mediaHash,
            timestamp: block.timestamp,
            likes: 0,
            rebounds: 0,
            isDeleted: false
        });

        _userSparks[msg.sender].push(sparkId);
        
        emit SparkCreated(sparkId, msg.sender, content, mediaHash);
        return sparkId;
    }

    /**
     * @dev Deletes a spark
     * @param sparkId ID of the spark to delete
     */
    function deleteSpark(uint256 sparkId) external {
        Spark storage spark = _sparks[sparkId];
        if (spark.author != msg.sender) revert Unauthorized();
        spark.isDeleted = true;
        emit SparkDeleted(sparkId, msg.sender);
    }

    /**
     * @dev Gets a spark by ID
     * @param sparkId ID of the spark to get
     * @return The Spark struct with the requested ID
     */
    function getSpark(uint256 sparkId) external view returns (Spark memory) {
        return _sparks[sparkId];
    }

    /**
     * @dev Likes a spark
     * @param sparkId ID of the spark to like
     */
    function likeSpark(uint256 sparkId) external {
        if (_likes[sparkId][msg.sender]) revert Unauthorized();
        _likes[sparkId][msg.sender] = true;
        _sparks[sparkId].likes++;
        emit SparkLiked(sparkId, msg.sender);
    }

    /**
     * @dev Unlikes a spark
     * @param sparkId ID of the spark to unlike
     */
    function unlikeSpark(uint256 sparkId) external {
        if (!_likes[sparkId][msg.sender]) revert Unauthorized();
        _likes[sparkId][msg.sender] = false;
        _sparks[sparkId].likes--;
        emit SparkUnliked(sparkId, msg.sender);
    }

    /**
     * @dev Gets the total number of sparks
     * @return The total number of sparks
     */
    function getSparkCount() external view returns (uint256) {
        return _sparkCount;
    }

    /**
     * @dev Gets all sparks by a specific author
     * @param author Address of the author
     * @return Array of spark IDs created by the author
     */
    function getSparksByAuthor(address author) external view returns (uint256[] memory) {
        return _userSparks[author];
    }
}
