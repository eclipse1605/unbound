// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../interfaces/ISparkRegistry.sol";

/**
 * @title MockSparkRegistry
 * @dev Mock implementation of ISparkRegistry for testing
 */
contract MockSparkRegistry is ISparkRegistry {
    // We'll use the Spark struct from the interface
    mapping(uint256 => Spark) private _sparks;
    mapping(address => uint256[]) private _userSparks;
    mapping(uint256 => mapping(address => bool)) private _likes;
    
    uint256 private _sparkCount;
    
    function createMockSpark(address author) external returns (uint256) {
        uint256 sparkId = _sparkCount++;
        
        _sparks[sparkId] = Spark({
            author: author,
            content: "Mock Spark",
            mediaHash: "",
            timestamp: block.timestamp,
            likes: 0,
            rebounds: 0,
            isDeleted: false
        });
        
        _userSparks[author].push(sparkId);
        
        return sparkId;
    }
    
    function createSpark(string memory content, string memory mediaHash) external returns (uint256) {
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
    
    function deleteSpark(uint256 sparkId) external {
        Spark storage spark = _sparks[sparkId];
        require(spark.author == msg.sender, "Unauthorized");
        spark.isDeleted = true;
        
        emit SparkDeleted(sparkId, msg.sender);
    }
    
    function getSpark(uint256 sparkId) external view returns (Spark memory) {
        return _sparks[sparkId];
    }
    
    function likeSpark(uint256 sparkId) external {
        require(!_likes[sparkId][msg.sender], "Already liked");
        
        _likes[sparkId][msg.sender] = true;
        _sparks[sparkId].likes++;
        
        emit SparkLiked(sparkId, msg.sender);
    }
    
    function unlikeSpark(uint256 sparkId) external {
        require(_likes[sparkId][msg.sender], "Not liked");
        
        _likes[sparkId][msg.sender] = false;
        _sparks[sparkId].likes--;
        
        emit SparkUnliked(sparkId, msg.sender);
    }
    
    function getSparkCount() external view returns (uint256) {
        return _sparkCount;
    }
    
    function getSparksByAuthor(address author) external view returns (uint256[] memory) {
        return _userSparks[author];
    }
    
    function incrementReboundCount(uint256 sparkId) external {
        _sparks[sparkId].rebounds++;
    }
} 