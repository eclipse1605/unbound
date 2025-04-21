// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title ICommentManager
 * @dev Interface for the CommentManager contract
 */
interface ICommentManager {
    /**
     * @dev Creates a new comment
     * @param sparkId The ID of the spark to comment on
     * @param content The content of the comment
     * @param parentId The ID of the parent comment (0 for root comments)
     * @return The ID of the new comment
     */
    function createComment(uint256 sparkId, string calldata content, uint256 parentId) external returns (uint256);
    
    /**
     * @dev Likes a comment
     * @param commentId The ID of the comment to like
     */
    function likeComment(uint256 commentId) external;
    
    /**
     * @dev Unlikes a comment
     * @param commentId The ID of the comment to unlike
     */
    function unlikeComment(uint256 commentId) external;
    
    /**
     * @dev Deletes a comment (marks as deleted)
     * @param commentId The ID of the comment to delete
     */
    function deleteComment(uint256 commentId) external;
    
    /**
     * @dev Gets a comment by ID
     * @param commentId The ID of the comment to get
     * @return id The comment ID
     * @return sparkId The spark ID
     * @return author The author address
     * @return content The comment content
     * @return parentId The parent comment ID (0 for root comments)
     * @return timestamp The timestamp when the comment was created
     * @return likes The number of likes on the comment
     */
    function getComment(uint256 commentId) external view returns (
        uint256 id,
        uint256 sparkId,
        address author,
        string memory content,
        uint256 parentId,
        uint256 timestamp,
        uint256 likes
    );
    
    /**
     * @dev Gets all comments for a spark
     * @param sparkId The ID of the spark
     * @return An array of comment IDs
     */
    function getCommentsForSpark(uint256 sparkId) external view returns (uint256[] memory);
    
    /**
     * @dev Gets all replies to a comment
     * @param commentId The ID of the parent comment
     * @return An array of reply comment IDs
     */
    function getRepliesForComment(uint256 commentId) external view returns (uint256[] memory);
    
    /**
     * @dev Checks if a user has liked a comment
     * @param commentId The ID of the comment
     * @param user The user address to check
     * @return True if the user has liked the comment
     */
    function hasLikedComment(uint256 commentId, address user) external view returns (bool);
    
    /**
     * @dev Gets all comments liked by a user
     * @param user The user address
     * @return An array of comment IDs
     */
    function getLikedCommentsByUser(address user) external view returns (uint256[] memory);
} 