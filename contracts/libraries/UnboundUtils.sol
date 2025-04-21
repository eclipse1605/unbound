// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library UnboundUtils {
    error InvalidAddress();
    error InvalidContent();
    error Unauthorized();
    error ComponentAlreadyInitialized();

    function validateAddress(address addr) internal pure {
        if (addr == address(0)) revert InvalidAddress();
    }

    function validateContent(string memory content) internal pure {
        if (bytes(content).length == 0) revert InvalidContent();
    }

    function validateAuthorization(address owner, address caller) internal pure {
        if (owner != caller) revert Unauthorized();
    }

    function validateComponentInitialization(bool isInitialized) internal pure {
        if (isInitialized) revert ComponentAlreadyInitialized();
    }
} 