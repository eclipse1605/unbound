// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ISocialGraph
 * @dev Interface for the SocialGraph contract which manages social connections (following/orbiting)
 */
interface ISocialGraph {
    /**
     * @dev Event emitted when a user orbits another user
     */
    event UserOrbited(address indexed orbiter, address indexed orbited);

    /**
     * @dev Event emitted when a user unorbits another user
     */
    event UserUnorbited(address indexed orbiter, address indexed unorbited);

    /**
     * @dev Allows a user to orbit another user
     * @param _user Address of the user to orbit
     */
    function orbitUser(address _user) external;

    /**
     * @dev Allows a user to unorbit another user
     * @param _user Address of the user to unorbit
     */
    function unorbitUser(address _user) external;

    /**
     * @dev Checks if a user is orbiting another user
     * @param _orbiter Address of the potential orbiter
     * @param _orbited Address of the potentially orbited user
     * @return True if _orbiter is orbiting _orbited, false otherwise
     */
    function isOrbiting(address _orbiter, address _orbited) external view returns (bool);

    /**
     * @dev Gets the number of users a user is orbiting
     * @param _user Address of the user
     * @return The number of users the given user is orbiting
     */
    function getOrbitingCount(address _user) external view returns (uint256);

    /**
     * @dev Gets the number of orbiters (followers) a user has
     * @param _user Address of the user
     * @return The number of users orbiting the given user
     */
    function getOrbiterCount(address _user) external view returns (uint256);

    /**
     * @dev Gets the addresses of users a user is orbiting
     * @param _user Address of the user
     * @return Array of addresses of users the given user is orbiting
     */
    function getOrbiting(address _user) external view returns (address[] memory);

    /**
     * @dev Gets the addresses of users orbiting a user
     * @param _user Address of the user
     * @return Array of addresses of users orbiting the given user
     */
    function getOrbiters(address _user) external view returns (address[] memory);

    event UserFollowed(address indexed follower, address indexed followed);
    event UserUnfollowed(address indexed follower, address indexed unfollowed);

    function follow(address userToFollow) external;
    function unfollow(address userToUnfollow) external;
    function isFollowing(address follower, address followed) external view returns (bool);
    function getFollowingCount(address user) external view returns (uint256);
    function getFollowersCount(address user) external view returns (uint256);
    function getFollowing(address user) external view returns (address[] memory);
    function getFollowers(address user) external view returns (address[] memory);
} 