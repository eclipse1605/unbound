// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IReboundManager
 * @dev Interface for the ReboundManager contract which manages rebounds (retweets)
 */
interface IReboundManager {
    struct Rebound {
        uint256 originalSparkId;
        address rebounder;
        string comment;
        uint256 timestamp;
    }

    /**
     * @dev Event emitted when a spark is rebounded
     */
    event SparkRebounded(
        uint256 indexed originalSparkId, 
        uint256 indexed reboundId, 
        address indexed rebounder, 
        string comment
    );

    /**
     * @dev Rebounds a spark (retweet)
     * @param _sparkId ID of the spark to rebound
     * @param _additionalContent Optional additional content to add to the rebound
     * @return The ID of the newly created rebound spark
     */
    function reboundSpark(uint256 _sparkId, string memory _additionalContent) external returns (uint256);

    /**
     * @dev Checks if a user has rebounded a spark
     * @param _sparkId ID of the spark to check
     * @param _user Address of the user to check
     * @return True if the user has rebounded the spark, false otherwise
     */
    function hasRebounded(uint256 _sparkId, address _user) external view returns (bool);

    /**
     * @dev Gets the rebound count for a spark
     * @param _sparkId ID of the spark to get the rebound count for
     * @return The number of times the spark has been rebounded
     */
    function getReboundCount(uint256 _sparkId) external view returns (uint256);

    /**
     * @dev Gets the IDs of sparks that are rebounds of a given spark
     * @param _sparkId ID of the original spark
     * @return Array of spark IDs that are rebounds of the given spark
     */
    function getReboundSparkIds(uint256 _sparkId) external view returns (uint256[] memory);

    /**
     * @dev Gets the original spark ID for a rebound
     * @param _reboundId ID of the rebound spark
     * @return The ID of the original spark, or 0 if not a rebound
     */
    function getOriginalSparkId(uint256 _reboundId) external view returns (uint256);

    function createRebound(uint256 originalSparkId, string memory comment) external returns (uint256);
    function getRebound(uint256 reboundId) external view returns (Rebound memory);
    function getReboundsBySpark(uint256 sparkId) external view returns (uint256[] memory);
    function getReboundsByUser(address user) external view returns (uint256[] memory);
} 