// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../interfaces/IUnboundCoordinator.sol";

/**
 * @title MockUnboundCoordinator
 * @dev Mock implementation of IUnboundCoordinator for testing
 */
contract MockUnboundCoordinator is IUnboundCoordinator {
    address private sparkRegistry;
    address private commentManager;
    address private reboundManager;
    address private socialGraph;
    address private interactionTracker;
    
    function setInitialComponents(
        address _sparkRegistry,
        address _reboundManager,
        address _socialGraph,
        address _interactionTracker
    ) external {
        sparkRegistry = _sparkRegistry;
        reboundManager = _reboundManager;
        socialGraph = _socialGraph;
        interactionTracker = _interactionTracker;
    }
    
    function upgradeComponent(string memory componentName, address newImplementation) external {
        if (keccak256(bytes(componentName)) == keccak256(bytes("sparkRegistry"))) {
            sparkRegistry = newImplementation;
        } else if (keccak256(bytes(componentName)) == keccak256(bytes("reboundManager"))) {
            reboundManager = newImplementation;
        } else if (keccak256(bytes(componentName)) == keccak256(bytes("socialGraph"))) {
            socialGraph = newImplementation;
        } else if (keccak256(bytes(componentName)) == keccak256(bytes("interactionTracker"))) {
            interactionTracker = newImplementation;
        } else if (keccak256(bytes(componentName)) == keccak256(bytes("commentManager"))) {
            commentManager = newImplementation;
        }
        
        emit ComponentUpgraded(componentName, newImplementation);
    }
    
    // These functions are for backward compatibility with older tests
    function setSparkRegistry(address _sparkRegistry) external {
        sparkRegistry = _sparkRegistry;
    }
    
    function setCommentManager(address _commentManager) external {
        commentManager = _commentManager;
    }
    
    function setReboundManager(address _reboundManager) external {
        reboundManager = _reboundManager;
    }
    
    function getSparkRegistry() external view returns (address) {
        return sparkRegistry;
    }
    
    function getReboundManager() external view returns (address) {
        return reboundManager;
    }
    
    function getSocialGraph() external view returns (address) {
        return socialGraph;
    }
    
    function getInteractionTracker() external view returns (address) {
        return interactionTracker;
    }
    
    function getCommentManager() external view returns (address) {
        return commentManager;
    }
} 