// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IInteractionTracker
 * @dev Interface for the InteractionTracker contract which manages likes and comments
 */
interface IInteractionTracker {
    /**
     * @dev Struct to represent a comment
     */
    struct Comment {
        uint256 id;
        uint256 sparkId;
        address author;
        string content;
        uint256 timestamp;
    }

    /**
     * @dev Event emitted when a spark is liked
     */
    event SparkLiked(uint256 indexed sparkId, address indexed liker);

    /**
     * @dev Event emitted when a spark is unliked
     */
    event SparkUnliked(uint256 indexed sparkId, address indexed unliker);

    /**
     * @dev Event emitted when a comment is created
     */
    event CommentCreated(
        uint256 indexed id,
        uint256 indexed sparkId,
        address indexed author,
        string content,
        uint256 timestamp
    );

    /**
     * @dev Allows a user to like a spark
     * @param _sparkId ID of the spark to like
     */
    function likeSpark(uint256 _sparkId) external;

    /**
     * @dev Allows a user to unlike a spark
     * @param _sparkId ID of the spark to unlike
     */
    function unlikeSpark(uint256 _sparkId) external;

    /**
     * @dev Allows a user to comment on a spark
     * @param _sparkId ID of the spark to comment on
     * @param _content Content of the comment
     * @return ID of the created comment
     */
    function createComment(uint256 _sparkId, string memory _content) external returns (uint256);

    /**
     * @dev Checks if a user has liked a spark
     * @param _sparkId ID of the spark to check
     * @param _user Address of the user to check
     * @return True if the user has liked the spark, false otherwise
     */
    function hasLiked(uint256 _sparkId, address _user) external view returns (bool);

    /**
     * @dev Gets the number of likes for a spark
     * @param _sparkId ID of the spark to get likes for
     * @return The number of likes for the spark
     */
    function getLikeCount(uint256 _sparkId) external view returns (uint256);

    /**
     * @dev Gets a comment by ID
     * @param _id ID of the comment to get
     * @return The Comment struct with the requested ID
     */
    function getComment(uint256 _id) external view returns (Comment memory);

    /**
     * @dev Gets all comments for a spark
     * @param _sparkId ID of the spark to get comments for
     * @return Array of comments for the spark
     */
    function getSparkComments(uint256 _sparkId) external view returns (Comment[] memory);

    /**
     * @dev Gets the total number of comments
     * @return The total number of comments
     */
    function getCommentCount() external view returns (uint256);

    /**
     * @dev Gets the number of comments for a spark
     * @param _sparkId ID of the spark to get comment count for
     * @return The number of comments for the spark
     */
    function getSparkCommentCount(uint256 _sparkId) external view returns (uint256);

    struct Interaction {
        address user;
        uint256 sparkId;
        uint256 timestamp;
        InteractionType interactionType;
    }

    enum InteractionType {
        LIKE,
        COMMENT,
        REBOUND
    }

    event InteractionCreated(
        uint256 indexed sparkId,
        address indexed user,
        InteractionType interactionType,
        string content
    );

    function createInteraction(
        uint256 sparkId,
        InteractionType interactionType,
        string memory content
    ) external;

    function getInteractionsBySpark(uint256 sparkId) external view returns (Interaction[] memory);
    function getInteractionsByUser(address user) external view returns (Interaction[] memory);
    function getInteractionCount(uint256 sparkId) external view returns (uint256);
    function hasInteracted(address user, uint256 sparkId) external view returns (bool);
} 