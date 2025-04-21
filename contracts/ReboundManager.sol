// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IReboundManager.sol";
import "./interfaces/ISparkRegistry.sol";
import "./libraries/UnboundUtils.sol";

// Custom errors
error Unauthorized();
/**
 * @title ReboundManager
 * @dev Contract for managing rebounds (retweets)
 */
contract ReboundManager is IReboundManager {
    using UnboundUtils for address;
    using UnboundUtils for string;

    // Main data storage
    mapping(uint256 => Rebound) private _rebounds;
    mapping(uint256 => uint256[]) private _sparkRebounds;
    mapping(address => uint256[]) private _userRebounds;
    
    uint256 private _reboundCount;
    address private _coordinator;
    ISparkRegistry private _sparkRegistry;
    bool private _initialized;
    
    /**
     * @dev Modifier to check if caller is the coordinator
     */
    modifier onlyCoordinator() {
        if (msg.sender != _coordinator) revert Unauthorized();
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
     * @param sparkRegistry Address of the SparkRegistry contract
     */
    function initialize(address coordinator, address sparkRegistry) external {
        UnboundUtils.validateComponentInitialization(_initialized);
        UnboundUtils.validateAddress(coordinator);
        UnboundUtils.validateAddress(sparkRegistry);
        
        _coordinator = coordinator;
        _sparkRegistry = ISparkRegistry(sparkRegistry);
        _initialized = true;
    }
    
    /**
     * @dev Creates a new rebound (repost)
     * @param originalSparkId ID of the original spark
     * @param comment Optional comment to add to the rebound
     * @return The ID of the newly created rebound
     */
    function createRebound(uint256 originalSparkId, string memory comment) public returns (uint256) {
        comment.validateContent();
        
        uint256 reboundId = _reboundCount++;
        _rebounds[reboundId] = Rebound({
            originalSparkId: originalSparkId,
            rebounder: msg.sender,
            comment: comment,
            timestamp: block.timestamp
        });

        _sparkRebounds[originalSparkId].push(reboundId);
        _userRebounds[msg.sender].push(reboundId);

        emit SparkRebounded(originalSparkId, reboundId, msg.sender, comment);
        return reboundId;
    }
    
    /**
     * @dev Gets a rebound by its ID
     * @param reboundId ID of the rebound
     * @return The rebound information
     */
    function getRebound(uint256 reboundId) external view returns (Rebound memory) {
        return _rebounds[reboundId];
    }
    
    /**
     * @dev Gets all rebounds for a given spark
     * @param sparkId ID of the original spark
     * @return Array of rebound IDs
     */
    function getReboundsBySpark(uint256 sparkId) external view returns (uint256[] memory) {
        return _sparkRebounds[sparkId];
    }
    
    /**
     * @dev Gets all rebounds for a given user
     * @param user Address of the user
     * @return Array of rebound IDs
     */
    function getReboundsByUser(address user) external view returns (uint256[] memory) {
        return _userRebounds[user];
    }
    
    /**
     * @dev Gets the rebound count for a given spark
     * @param sparkId ID of the original spark
     * @return The number of times the spark has been rebounded
     */
    function getReboundCount(uint256 sparkId) external view returns (uint256) {
        return _sparkRebounds[sparkId].length;
    }
    
    /**
     * @dev Gets the original spark ID for a rebound
     * @param _reboundId ID of the rebound spark
     * @return The ID of the original spark, or 0 if not a rebound
     */
    function getOriginalSparkId(uint256 _reboundId) external view returns (uint256) {
        return _rebounds[_reboundId].originalSparkId;
    }
    
    /**
     * @dev Gets the IDs of sparks that are rebounds of a given spark
     * @param _sparkId ID of the original spark
     * @return Array of spark IDs that are rebounds of the given spark
     */
    function getReboundSparkIds(uint256 _sparkId) external view returns (uint256[] memory) {
        return _sparkRebounds[_sparkId];
    }
    
    /**
     * @dev Checks if a user has rebounded a spark
     * @param _sparkId ID of the spark to check
     * @param _user Address of the user to check
     * @return True if the user has rebounded the spark, false otherwise
     */
    function hasRebounded(uint256 _sparkId, address _user) external view returns (bool) {
        uint256[] memory userRebounds = _userRebounds[_user];
        for (uint256 i = 0; i < userRebounds.length; i++) {
            if (_rebounds[userRebounds[i]].originalSparkId == _sparkId) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Rebounds a spark (retweet)
     * @param _sparkId ID of the spark to rebound
     * @param _additionalContent Optional additional content to add to the rebound
     * @return The ID of the newly created rebound
     */
    function reboundSpark(uint256 _sparkId, string memory _additionalContent) external returns (uint256) {
        return createRebound(_sparkId, _additionalContent);
    }
} 