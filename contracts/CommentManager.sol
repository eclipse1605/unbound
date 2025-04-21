// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./interfaces/IUnboundCoordinator.sol";
import "./interfaces/ICommentManager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CommentManager
 * @dev Manages comments and likes for sparks and rebounds
 */
contract CommentManager is ICommentManager, Ownable {
    // Comment structure
    struct Comment {
        uint256 id;
        uint256 sparkId;
        address author;
        string content;
        uint256 parentId;
        uint256 timestamp;
        uint256 likes;
        bool deleted;
    }

    // Coordinator contract reference
    IUnboundCoordinator public coordinator;

    // Comment storage
    mapping(uint256 => Comment) private comments;
    uint256 private nextCommentId = 1;

    // Spark to comment mappings
    mapping(uint256 => uint256[]) private sparkComments;
    
    // Parent comment to replies mappings
    mapping(uint256 => uint256[]) private commentReplies;
    
    // User likes mappings
    mapping(address => mapping(uint256 => bool)) private userLikes;
    mapping(address => uint256[]) private userLikedComments;

    // Events
    event CommentCreated(uint256 indexed commentId, uint256 indexed sparkId, address indexed author, uint256 parentId);
    event CommentLiked(uint256 indexed commentId, address indexed liker);
    event CommentUnliked(uint256 indexed commentId, address indexed unliker);
    event CommentDeleted(uint256 indexed commentId);

    // Modifiers
    modifier commentExists(uint256 commentId) {
        require(comments[commentId].id == commentId, "Comment does not exist");
        _;
    }

    modifier onlyAuthor(uint256 commentId) {
        require(comments[commentId].author == msg.sender, "Only the author can perform this action");
        _;
    }

    /**
     * @dev Constructor
     * @param _coordinator The address of the UnboundCoordinator contract
     */
    constructor(address _coordinator) {
        coordinator = IUnboundCoordinator(_coordinator);
    }

    /**
     * @dev Creates a new comment
     * @param sparkId The ID of the spark to comment on
     * @param content The content of the comment
     * @param parentId The ID of the parent comment (0 for root comments)
     * @return The ID of the new comment
     */
    function createComment(
        uint256 sparkId, 
        string calldata content, 
        uint256 parentId
    ) external override returns (uint256) {
        require(bytes(content).length > 0, "Comment content cannot be empty");
        require(bytes(content).length <= 1000, "Comment content too long");
        
        // If parent ID is provided, ensure it exists
        if (parentId > 0) {
            require(comments[parentId].id == parentId, "Parent comment does not exist");
            require(!comments[parentId].deleted, "Cannot reply to a deleted comment");
        }

        uint256 commentId = nextCommentId++;
        
        comments[commentId] = Comment({
            id: commentId,
            sparkId: sparkId,
            author: msg.sender,
            content: content,
            parentId: parentId,
            timestamp: block.timestamp,
            likes: 0,
            deleted: false
        });

        // Add to spark comments if it's a root comment
        if (parentId == 0) {
            sparkComments[sparkId].push(commentId);
        } else {
            // Add to parent comment replies
            commentReplies[parentId].push(commentId);
        }

        emit CommentCreated(commentId, sparkId, msg.sender, parentId);
        
        return commentId;
    }

    /**
     * @dev Likes a comment
     * @param commentId The ID of the comment to like
     */
    function likeComment(uint256 commentId) external override commentExists(commentId) {
        require(!comments[commentId].deleted, "Cannot like a deleted comment");
        require(!userLikes[msg.sender][commentId], "Already liked this comment");
        
        comments[commentId].likes++;
        userLikes[msg.sender][commentId] = true;
        userLikedComments[msg.sender].push(commentId);
        
        emit CommentLiked(commentId, msg.sender);
    }

    /**
     * @dev Unlikes a comment
     * @param commentId The ID of the comment to unlike
     */
    function unlikeComment(uint256 commentId) external override commentExists(commentId) {
        require(userLikes[msg.sender][commentId], "Haven't liked this comment");
        
        comments[commentId].likes--;
        userLikes[msg.sender][commentId] = false;
        
        // Remove from userLikedComments array
        uint256[] storage likedComments = userLikedComments[msg.sender];
        for (uint i = 0; i < likedComments.length; i++) {
            if (likedComments[i] == commentId) {
                likedComments[i] = likedComments[likedComments.length - 1];
                likedComments.pop();
                break;
            }
        }
        
        emit CommentUnliked(commentId, msg.sender);
    }

    /**
     * @dev Deletes a comment (marks as deleted)
     * @param commentId The ID of the comment to delete
     */
    function deleteComment(uint256 commentId) external override commentExists(commentId) onlyAuthor(commentId) {
        require(!comments[commentId].deleted, "Comment already deleted");
        
        comments[commentId].deleted = true;
        comments[commentId].content = ""; // Clear content for gas refund
        
        emit CommentDeleted(commentId);
    }

    /**
     * @dev Gets a comment by ID
     * @param commentId The ID of the comment to get
     * @return id The comment ID
     * @return sparkId The spark ID
     * @return author The author address
     * @return content The comment content (empty if deleted)
     * @return parentId The parent comment ID
     * @return timestamp The creation timestamp
     * @return likes The number of likes
     */
    function getComment(uint256 commentId) external view override commentExists(commentId) returns (
        uint256 id,
        uint256 sparkId,
        address author,
        string memory content,
        uint256 parentId,
        uint256 timestamp,
        uint256 likes
    ) {
        Comment storage comment = comments[commentId];
        
        return (
            comment.id,
            comment.sparkId,
            comment.author,
            comment.deleted ? "" : comment.content,
            comment.parentId,
            comment.timestamp,
            comment.likes
        );
    }

    /**
     * @dev Gets all comments for a spark
     * @param sparkId The ID of the spark
     * @return An array of comment IDs
     */
    function getCommentsForSpark(uint256 sparkId) external view override returns (uint256[] memory) {
        return sparkComments[sparkId];
    }

    /**
     * @dev Gets all replies to a comment
     * @param commentId The ID of the parent comment
     * @return An array of reply comment IDs
     */
    function getRepliesForComment(uint256 commentId) external view override commentExists(commentId) returns (uint256[] memory) {
        return commentReplies[commentId];
    }

    /**
     * @dev Checks if a user has liked a comment
     * @param commentId The ID of the comment
     * @param user The user address to check
     * @return True if the user has liked the comment
     */
    function hasLikedComment(uint256 commentId, address user) external view override returns (bool) {
        return userLikes[user][commentId];
    }

    /**
     * @dev Gets all comments liked by a user
     * @param user The user address
     * @return An array of comment IDs
     */
    function getLikedCommentsByUser(address user) external view override returns (uint256[] memory) {
        return userLikedComments[user];
    }

    /**
     * @dev Updates the coordinator address
     * @param _coordinator The new coordinator address
     */
    function setCoordinator(address _coordinator) external onlyOwner {
        coordinator = IUnboundCoordinator(_coordinator);
    }
} 