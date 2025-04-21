// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library IPFS {
    error InvalidIPFSHash();
    error InvalidIPFSContent();

    /**
     * @dev Validates an IPFS hash
     * @param hash The IPFS hash to validate
     */
    function validateIPFSHash(string memory hash) internal pure {
        bytes memory hashBytes = bytes(hash);
        
        // IPFS hash must not be empty
        if (hashBytes.length == 0) revert InvalidIPFSHash();
        
        // Check for standard Qm hash - CIDv0, most common
        // Allow both direct hash and ipfs:// prefix
        if (hashBytes.length == 46 && hashBytes[0] == 'Q' && hashBytes[1] == 'm') {
            return; // Valid CIDv0 hash
        }
        
        // Check for ipfs:// prefixed hash
        if (hashBytes.length > 7) {
            // Check if starts with "ipfs://"
            if (hashBytes[0] == 'i' && hashBytes[1] == 'p' && hashBytes[2] == 'f' && hashBytes[3] == 's' &&
                hashBytes[4] == ':' && hashBytes[5] == '/' && hashBytes[6] == '/') {
                
                // Ensure there's content after the prefix
                if (hashBytes.length > 7) {
                    return; // Valid ipfs:// prefixed hash
                }
            }
        }
        
        // If we get here, invalid hash
        revert InvalidIPFSHash();
    }

    /**
     * @dev Validates IPFS content
     * @param content The content to validate
     */
    function validateContent(string memory content) internal pure {
        if (bytes(content).length == 0) revert InvalidIPFSContent();
    }

    /**
     * @dev Constructs an IPFS URL
     * @param hash The IPFS hash
     * @return The full IPFS URL
     */
    function getURL(string memory hash) internal pure returns (string memory) {
        return string(abi.encodePacked("ipfs://", hash));
    }

    /**
     * @dev Constructs a Pinata gateway URL
     * @param hash The IPFS hash
     * @return The Pinata gateway URL
     */
    function getPinataURL(string memory hash) internal pure returns (string memory) {
        return string(abi.encodePacked("https://gateway.pinata.cloud/ipfs/", hash));
    }
    
    /**
     * @dev Normalizes an IPFS hash by removing any ipfs:// prefix
     * @param hash The IPFS hash to normalize
     * @return The normalized hash
     */
    function normalizeHash(string memory hash) internal pure returns (string memory) {
        bytes memory hashBytes = bytes(hash);
        
        // Check if starts with "ipfs://"
        if (hashBytes.length > 7 &&
            hashBytes[0] == 'i' && hashBytes[1] == 'p' && hashBytes[2] == 'f' && hashBytes[3] == 's' &&
            hashBytes[4] == ':' && hashBytes[5] == '/' && hashBytes[6] == '/') {
            
            // Extract just the hash part
            bytes memory normalized = new bytes(hashBytes.length - 7);
            for (uint i = 7; i < hashBytes.length; i++) {
                normalized[i - 7] = hashBytes[i];
            }
            
            return string(normalized);
        }
        
        // Already normalized
        return hash;
    }
} 