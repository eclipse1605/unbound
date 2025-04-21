// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../../contracts/interfaces/IUnboundCoordinator.sol";

/**
 * @title MockUnboundCoordinator
 * @dev Mock implementation of IUnboundCoordinator for testing
 */
contract MockUnboundCoordinator is IUnboundCoordinator {
    address private sparkRegistry;
    address private commentManager;
    address private reboundManager;
    
    function setSparkRegistry(address _sparkRegistry) external {
        sparkRegistry = _sparkRegistry;
    }
    
    function setCommentManager(address _commentManager) external {
        commentManager = _commentManager;
    }
    
    function setReboundManager(address _reboundManager) external {
        reboundManager = _reboundManager;
    }
    
    function getSparkRegistry() external view override returns (address) {
        return sparkRegistry;
    }
    
    function getCommentManager() external view override returns (address) {
        return commentManager;
    }
    
    function getReboundManager() external view override returns (address) {
        return reboundManager;
    }
} 