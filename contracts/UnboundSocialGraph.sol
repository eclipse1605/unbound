// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SocialGraph.sol";

contract UnboundSocialGraph is SocialGraph {
    constructor() SocialGraph() {}

    // No additional implementation needed as the base contract already implements
    // all required functionality from ISocialGraph
} 