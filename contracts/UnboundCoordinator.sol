// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IUnboundCoordinator.sol";
import "./libraries/UnboundUtils.sol";

// Custom errors
error Unauthorized();
/**
 * @title UnboundCoordinator
 * @dev Contract for coordinating all the components of the Unbound platform
 */
contract UnboundCoordinator is IUnboundCoordinator {
    using UnboundUtils for address;

    // Component addresses
    address private _sparkRegistry;
    address private _reboundManager;
    address private _socialGraph;
    address private _interactionTracker;
    
    // Access control
    address private _owner;
    bool private _initialized;
    
    // Events for component upgrades

    
    /**
     * @dev Modifier to check if caller is the owner
     */
    modifier onlyOwner() {
        if (msg.sender != _owner) revert Unauthorized();
        _;
    }
    
    /**
     * @dev Constructor
     */
    constructor() {
        _owner = msg.sender;
    }
    
    /**
     * @dev Sets the initial components
     * @param sparkRegistry Address of the SparkRegistry contract
     * @param reboundManager Address of the ReboundManager contract
     * @param socialGraph Address of the SocialGraph contract
     * @param interactionTracker Address of the InteractionTracker contract
     */
    function setInitialComponents(
        address sparkRegistry,
        address reboundManager,
        address socialGraph,
        address interactionTracker
    ) external onlyOwner {
        UnboundUtils.validateComponentInitialization(_initialized);
        UnboundUtils.validateAddress(sparkRegistry);
        UnboundUtils.validateAddress(reboundManager);
        UnboundUtils.validateAddress(socialGraph);
        UnboundUtils.validateAddress(interactionTracker);

        _sparkRegistry = sparkRegistry;
        _reboundManager = reboundManager;
        _socialGraph = socialGraph;
        _interactionTracker = interactionTracker;
        _initialized = true;
    }
    
    /**
     * @dev Gets the SparkRegistry contract
     * @return The address of the SparkRegistry contract
     */
    function getSparkRegistry() external view override returns (address) {
        return _sparkRegistry;
    }
    
    /**
     * @dev Gets the ReboundManager contract
     * @return The address of the ReboundManager contract
     */
    function getReboundManager() external view override returns (address) {
        return _reboundManager;
    }
    
    /**
     * @dev Gets the SocialGraph contract
     * @return The address of the SocialGraph contract
     */
    function getSocialGraph() external view override returns (address) {
        return _socialGraph;
    }
    
    /**
     * @dev Gets the InteractionTracker contract
     * @return The address of the InteractionTracker contract
     */
    function getInteractionTracker() external view override returns (address) {
        return _interactionTracker;
    }
    
    /**
     * @dev Upgrades a component
     * @param componentName The name of the component to upgrade
     * @param newImplementation The address of the new implementation
     */
    function upgradeComponent(string memory componentName, address newImplementation) external override onlyOwner {
        UnboundUtils.validateAddress(newImplementation);

        if (keccak256(bytes(componentName)) == keccak256(bytes("SparkRegistry"))) {
            _sparkRegistry = newImplementation;
        } else if (keccak256(bytes(componentName)) == keccak256(bytes("ReboundManager"))) {
            _reboundManager = newImplementation;
        } else if (keccak256(bytes(componentName)) == keccak256(bytes("SocialGraph"))) {
            _socialGraph = newImplementation;
        } else if (keccak256(bytes(componentName)) == keccak256(bytes("InteractionTracker"))) {
            _interactionTracker = newImplementation;
        } else {
            revert("Invalid component name");
        }

        emit ComponentUpgraded(componentName, newImplementation);
    }
} 