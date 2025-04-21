// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IInteractionTracker.sol";
import "./libraries/UnboundUtils.sol";

// Custom errors
error Unauthorized();
/**
 * @title InteractionTracker
 * @dev Contract for managing likes and comments
 */
contract InteractionTracker is IInteractionTracker {
    using UnboundUtils for address;
    using UnboundUtils for string;

    mapping(uint256 => Interaction[]) private _sparkInteractions;
    mapping(address => Interaction[]) private _userInteractions;
    mapping(uint256 => mapping(address => bool)) private _hasInteracted;
    mapping(uint256 => mapping(address => bool)) private _hasLiked;
    mapping(uint256 => uint256) private _sparkLikes;
    mapping(uint256 => Comment[]) private _sparkComments;
    
    uint256 private _commentCount;
    address private _coordinator;
    bool private _initialized;

    modifier onlyCoordinator() {
        if (msg.sender != _coordinator) revert Unauthorized();
        _;
    }

    constructor() {
        _coordinator = msg.sender;
    }

    function initialize(address coordinator) external {
        UnboundUtils.validateComponentInitialization(_initialized);
        UnboundUtils.validateAddress(coordinator);
        _coordinator = coordinator;
        _initialized = true;
    }

    function createInteraction(
        uint256 sparkId,
        InteractionType interactionType,
        string memory content
    ) public {
        if (interactionType == InteractionType.COMMENT) {
            content.validateContent();
        }

        Interaction memory interaction = Interaction({
            user: msg.sender,
            sparkId: sparkId,
            timestamp: block.timestamp,
            interactionType: interactionType
        });

        _sparkInteractions[sparkId].push(interaction);
        _userInteractions[msg.sender].push(interaction);
        _hasInteracted[sparkId][msg.sender] = true;

        emit InteractionCreated(sparkId, msg.sender, interactionType, content);
    }

    function getInteractionsBySpark(uint256 sparkId) external view returns (Interaction[] memory) {
        return _sparkInteractions[sparkId];
    }

    function getInteractionsByUser(address user) external view returns (Interaction[] memory) {
        return _userInteractions[user];
    }

    function getInteractionCount(uint256 sparkId) external view returns (uint256) {
        return _sparkInteractions[sparkId].length;
    }

    function hasInteracted(address user, uint256 sparkId) external view returns (bool) {
        return _hasInteracted[sparkId][user];
    }
    
    /**
     * @dev Allows a user to like a spark
     * @param _sparkId ID of the spark to like
     */
    function likeSpark(uint256 _sparkId) external {
        if (_hasLiked[_sparkId][msg.sender]) revert Unauthorized();
        
        _hasLiked[_sparkId][msg.sender] = true;
        _sparkLikes[_sparkId]++;
        
        // Also record as an interaction
        createInteraction(_sparkId, InteractionType.LIKE, "");
        
        emit SparkLiked(_sparkId, msg.sender);
    }

    /**
     * @dev Allows a user to unlike a spark
     * @param _sparkId ID of the spark to unlike
     */
    function unlikeSpark(uint256 _sparkId) external {
        if (!_hasLiked[_sparkId][msg.sender]) revert Unauthorized();
        
        _hasLiked[_sparkId][msg.sender] = false;
        _sparkLikes[_sparkId]--;
        
        emit SparkUnliked(_sparkId, msg.sender);
    }

    /**
     * @dev Allows a user to comment on a spark
     * @param _sparkId ID of the spark to comment on
     * @param _content Content of the comment
     * @return ID of the created comment
     */
    function createComment(uint256 _sparkId, string memory _content) external returns (uint256) {
        _content.validateContent();
        
        uint256 commentId = _commentCount++;
        
        Comment memory comment = Comment({
            id: commentId,
            sparkId: _sparkId,
            author: msg.sender,
            content: _content,
            timestamp: block.timestamp
        });
        
        _sparkComments[_sparkId].push(comment);
        
        // Also record as an interaction
        createInteraction(_sparkId, InteractionType.COMMENT, _content);
        
        emit CommentCreated(commentId, _sparkId, msg.sender, _content, block.timestamp);
        
        return commentId;
    }

    /**
     * @dev Checks if a user has liked a spark
     * @param _sparkId ID of the spark to check
     * @param _user Address of the user to check
     * @return True if the user has liked the spark, false otherwise
     */
    function hasLiked(uint256 _sparkId, address _user) external view returns (bool) {
        return _hasLiked[_sparkId][_user];
    }

    /**
     * @dev Gets the number of likes for a spark
     * @param _sparkId ID of the spark to get likes for
     * @return The number of likes for the spark
     */
    function getLikeCount(uint256 _sparkId) external view returns (uint256) {
        return _sparkLikes[_sparkId];
    }

    /**
     * @dev Gets a comment by ID
     * @param _id ID of the comment to get
     * @return The Comment struct with the requested ID
     */
    function getComment(uint256 _id) external view returns (Comment memory) {
        // This is a simplified implementation 
        // In a real-world scenario, we would use a mapping from ID to Comment
        for (uint256 sparkId = 0; ; sparkId++) {
            Comment[] memory comments = _sparkComments[sparkId];
            for (uint256 i = 0; i < comments.length; i++) {
                if (comments[i].id == _id) {
                    return comments[i];
                }
            }
        }
        
        // Should never reach here in practice
        revert Unauthorized();
    }

    /**
     * @dev Gets all comments for a spark
     * @param _sparkId ID of the spark to get comments for
     * @return Array of comments for the spark
     */
    function getSparkComments(uint256 _sparkId) external view returns (Comment[] memory) {
        return _sparkComments[_sparkId];
    }

    /**
     * @dev Gets the total number of comments
     * @return The total number of comments
     */
    function getCommentCount() external view returns (uint256) {
        return _commentCount;
    }

    /**
     * @dev Gets the number of comments for a spark
     * @param _sparkId ID of the spark to get comment count for
     * @return The number of comments for the spark
     */
    function getSparkCommentCount(uint256 _sparkId) external view returns (uint256) {
        return _sparkComments[_sparkId].length;
    }
} 