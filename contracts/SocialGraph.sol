// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ISocialGraph.sol";
import "./libraries/UnboundUtils.sol";

// Custom errors
error Unauthorized();
/**
 * @title SocialGraph
 * @dev Contract for managing social connections (orbiting/following)
 */
contract SocialGraph is ISocialGraph {
    using UnboundUtils for address;

    // Main data storage
    mapping(address => mapping(address => bool)) private _following;
    mapping(address => uint256) private _followingCount;
    mapping(address => uint256) private _followersCount;
    mapping(address => address[]) private _followingList;
    mapping(address => address[]) private _followersList;
    
    // Coordinator reference
    address private _coordinator;
    
    // Access control
    bool private _initialized;
    
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
     */
    function initialize(address coordinator) external {
        UnboundUtils.validateComponentInitialization(_initialized);
        UnboundUtils.validateAddress(coordinator);
        _coordinator = coordinator;
        _initialized = true;
    }
    
    /**
     * @dev Allows a user to follow another user
     * @param userToFollow Address of the user to follow
     */
    function follow(address userToFollow) public {
        if (userToFollow == msg.sender) revert Unauthorized();
        if (_following[msg.sender][userToFollow]) revert Unauthorized();

        _following[msg.sender][userToFollow] = true;
        _followingCount[msg.sender]++;
        _followersCount[userToFollow]++;
        _followingList[msg.sender].push(userToFollow);
        _followersList[userToFollow].push(msg.sender);

        emit UserFollowed(msg.sender, userToFollow);
    }
    
    /**
     * @dev Allows a user to unfollow another user
     * @param userToUnfollow Address of the user to unfollow
     */
    function unfollow(address userToUnfollow) public {
        if (!_following[msg.sender][userToUnfollow]) revert Unauthorized();

        _following[msg.sender][userToUnfollow] = false;
        _followingCount[msg.sender]--;
        _followersCount[userToUnfollow]--;

        // Remove from following list
        address[] storage following = _followingList[msg.sender];
        for (uint256 i = 0; i < following.length; i++) {
            if (following[i] == userToUnfollow) {
                following[i] = following[following.length - 1];
                following.pop();
                break;
            }
        }

        // Remove from followers list
        address[] storage followers = _followersList[userToUnfollow];
        for (uint256 i = 0; i < followers.length; i++) {
            if (followers[i] == msg.sender) {
                followers[i] = followers[followers.length - 1];
                followers.pop();
                break;
            }
        }

        emit UserUnfollowed(msg.sender, userToUnfollow);
    }
    
    /**
     * @dev Checks if a user is following another user
     * @param follower Address of the potential follower
     * @param followed Address of the potentially followed user
     * @return True if _follower is following _followed, false otherwise
     */
    function isFollowing(address follower, address followed) external view returns (bool) {
        return _following[follower][followed];
    }
    
    /**
     * @dev Gets the number of users a user is following
     * @param user Address of the user
     * @return The number of users the given user is following
     */
    function getFollowingCount(address user) external view returns (uint256) {
        return _followingCount[user];
    }
    
    /**
     * @dev Gets the number of followers (followers) a user has
     * @param user Address of the user
     * @return The number of users following the given user
     */
    function getFollowersCount(address user) external view returns (uint256) {
        return _followersCount[user];
    }
    
    /**
     * @dev Gets the addresses of users a user is following
     * @param user Address of the user
     * @return Array of addresses of users the given user is following
     */
    function getFollowing(address user) external view returns (address[] memory) {
        return _followingList[user];
    }
    
    /**
     * @dev Gets the addresses of users following a user
     * @param user Address of the user
     * @return Array of addresses of users following the given user
     */
    function getFollowers(address user) external view returns (address[] memory) {
        return _followersList[user];
    }
    
    /**
     * @dev Allows a user to orbit another user (same as follow)
     * @param _user Address of the user to orbit
     */
    function orbitUser(address _user) external {
        follow(_user);
        emit UserOrbited(msg.sender, _user);
    }

    /**
     * @dev Allows a user to unorbit another user (same as unfollow)
     * @param _user Address of the user to unorbit
     */
    function unorbitUser(address _user) external {
        unfollow(_user);
        emit UserUnorbited(msg.sender, _user);
    }

    /**
     * @dev Checks if a user is orbiting another user (same as isFollowing)
     * @param _orbiter Address of the potential orbiter
     * @param _orbited Address of the potentially orbited user
     * @return True if _orbiter is orbiting _orbited, false otherwise
     */
    function isOrbiting(address _orbiter, address _orbited) external view returns (bool) {
        return _following[_orbiter][_orbited];
    }

    /**
     * @dev Gets the number of users a user is orbiting (same as following count)
     * @param _user Address of the user
     * @return The number of users the given user is orbiting
     */
    function getOrbitingCount(address _user) external view returns (uint256) {
        return _followingCount[_user];
    }

    /**
     * @dev Gets the number of orbiters a user has (same as followers count)
     * @param _user Address of the user
     * @return The number of users orbiting the given user
     */
    function getOrbiterCount(address _user) external view returns (uint256) {
        return _followersCount[_user];
    }

    /**
     * @dev Gets the addresses of users a user is orbiting (same as following)
     * @param _user Address of the user
     * @return Array of addresses of users the given user is orbiting
     */
    function getOrbiting(address _user) external view returns (address[] memory) {
        return _followingList[_user];
    }

    /**
     * @dev Gets the addresses of users orbiting a user (same as followers)
     * @param _user Address of the user
     * @return Array of addresses of users orbiting the given user
     */
    function getOrbiters(address _user) external view returns (address[] memory) {
        return _followersList[_user];
    }
} 