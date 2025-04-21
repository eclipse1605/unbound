// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ISparkRegistry.sol";
import "./IReboundManager.sol";
import "./ISocialGraph.sol";
import "./IInteractionTracker.sol";

/**
 * @title IUnboundCoordinator
 * @dev Interface for the UnboundCoordinator contract which coordinates all the components
 */
interface IUnboundCoordinator {
    event ComponentUpgraded(string componentName, address newImplementation);

    function setInitialComponents(
        address sparkRegistry,
        address reboundManager,
        address socialGraph,
        address interactionTracker
    ) external;

    function upgradeComponent(string memory componentName, address newImplementation) external;

    function getSparkRegistry() external view returns (address);
    function getReboundManager() external view returns (address);
    function getSocialGraph() external view returns (address);
    function getInteractionTracker() external view returns (address);
} 