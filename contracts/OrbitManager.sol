// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OrbitManager {
    mapping(address => mapping(address => bool)) private isOrbiting; // follower => followed => true/false
    mapping(address => address[]) private orbiters; // user => followers
    mapping(address => address[]) private orbits;   // user => following

    event Orbited(address indexed follower, address indexed followed);
    event Unorbited(address indexed follower, address indexed followed);

    function orbit(address userToFollow) external {
        require(userToFollow != msg.sender, "Cannot orbit yourself");
        require(!isOrbiting[msg.sender][userToFollow], "Already orbiting");
        isOrbiting[msg.sender][userToFollow] = true;
        orbiters[userToFollow].push(msg.sender);
        orbits[msg.sender].push(userToFollow);
        emit Orbited(msg.sender, userToFollow);
    }

    function unorbit(address userToUnfollow) external {
        require(isOrbiting[msg.sender][userToUnfollow], "Not orbiting");
        isOrbiting[msg.sender][userToUnfollow] = false;
        // Remove from orbiters and orbits arrays
        _removeAddress(orbiters[userToUnfollow], msg.sender);
        _removeAddress(orbits[msg.sender], userToUnfollow);
        emit Unorbited(msg.sender, userToUnfollow);
    }

    function getOrbiters(address user) external view returns (address[] memory) {
        return orbiters[user];
    }

    function getOrbits(address user) external view returns (address[] memory) {
        return orbits[user];
    }

    function isOrbitingUser(address follower, address followed) external view returns (bool) {
        return isOrbiting[follower][followed];
    }

    function _removeAddress(address[] storage arr, address addr) internal {
        uint len = arr.length;
        for (uint i = 0; i < len; i++) {
            if (arr[i] == addr) {
                arr[i] = arr[len - 1];
                arr.pop();
                break;
            }
        }
    }
}
