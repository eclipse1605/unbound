// utils/ipfs.js
// Utility functions for interacting with IPFS

// Primary IPFS gateway
const PRIMARY_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

// Parse fallback gateways from environment variable
const FALLBACK_GATEWAYS = [
  'https://ipfs.io/ipfs',
  'https://cloudflare-ipfs.com/ipfs',
  'https://ipfs.fleek.co/ipfs',
  'https://dweb.link/ipfs',
  ...(process.env.NEXT_PUBLIC_IPFS_FALLBACK_GATEWAYS || '')
    .split(',')
    .filter(Boolean)
    .map(gateway => gateway.trim())
];

// IPFS Gateway URL - use public gateway or configure your own
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

/**
 * Check if a string is an IPFS hash
 * @param {string} str - String to check
 * @returns {boolean} - True if the string is likely an IPFS hash
 */
export function isIpfsHash(str) {
    // More permissive check for IPFS hash format
    if (!str || typeof str !== 'string') return false;
    
    // Clean up the string if it has prefixes or other artifacts
    const cleanedStr = str.trim().replace('ipfs://', '').replace('/ipfs/', '');
    
    // Standard CIDv0 and CIDv1 hash formats
    const cid0Regex = /^Qm[a-zA-Z0-9]{44}$/;
    const cid1Regex = /^b[a-zA-Z0-9]{58,}$/;
    
    // Also check for generic alphanumeric strings that might be hashes
    const genericHashRegex = /^[A-Za-z0-9]{32,}$/;
    
    console.log("Checking if potential IPFS hash:", cleanedStr);
    const result = cid0Regex.test(cleanedStr) || cid1Regex.test(cleanedStr) || genericHashRegex.test(cleanedStr);
    console.log("isIpfsHash result:", result);
    
    return result;
}

/**
 * Constructs the full IPFS URL for a given hash
 * @param {string} hash - IPFS hash
 * @returns {string} - Full IPFS URL
 */
export const getIpfsUrl = (hash) => {
  if (!hash) return null;
  
  // Handle if the hash already contains ipfs://
  if (hash.startsWith('ipfs://')) {
    hash = hash.replace('ipfs://', '');
  }
  
  return `${IPFS_GATEWAY}${hash}`;
};

/**
 * Fetch content from IPFS
 * @param {string} hash - IPFS hash
 * @returns {Promise<string|object>} - Content from IPFS
 */
export async function fetchIpfsContent(hash) {
    if (!hash) {
        console.error("Empty hash provided to fetchIpfsContent");
        return "No content available";
    }

    // Clean the hash (remove ipfs:// or /ipfs/ prefixes if present)
    const cleanHash = hash.trim().replace('ipfs://', '').replace('/ipfs/', '');
    console.log("Fetching IPFS content for hash:", cleanHash);
    
    // List of IPFS gateways to try
    const gateways = [
        `https://gateway.pinata.cloud/ipfs/${cleanHash}`,
        `https://cloudflare-ipfs.com/ipfs/${cleanHash}`,
        `https://ipfs.io/ipfs/${cleanHash}`,
        `https://gateway.ipfs.io/ipfs/${cleanHash}`,
        `https://dweb.link/ipfs/${cleanHash}`
    ];
    
    // Try each gateway until one works
    for (const gateway of gateways) {
        try {
            console.log("Trying gateway:", gateway);
            const res = await fetch(gateway, { timeout: 8000 });
            
            if (!res.ok) {
                console.warn(`Gateway ${gateway} returned status ${res.status}, trying next...`);
                continue;
            }
            
            try {
                const data = await res.json();
                console.log("IPFS content retrieved:", data);
                
                if (data && typeof data === 'object') {
                    // Try different common field names for content
                    if (data.content) return data.content;
                    if (data.text) return data.text;
                    if (data.message) return data.message;
                    if (data.body) return data.body;
                    if (data.data) return typeof data.data === 'string' ? data.data : JSON.stringify(data.data);
                    
                    // If no recognized field but it's an object, stringify it
                    return JSON.stringify(data);
                } else if (typeof data === 'string') {
                    return data;
                } else {
                    return "Unknown content format";
                }
            } catch (jsonError) {
                // If not JSON, try to get it as text
                const text = await res.text();
                if (text) return text;
            }
        } catch (error) {
            console.error(`Error fetching from gateway ${gateway}:`, error);
            // Continue to next gateway
        }
    }
    
    // If all gateways fail
    console.error("All IPFS gateways failed for hash:", cleanHash);
    return "Content currently unavailable";
}

/**
 * Upload content to IPFS (using a service like Pinata or nft.storage)
 * This is a placeholder that should be implemented with your IPFS service
 * @param {string|object} content - Content to upload
 * @returns {Promise<string>} - IPFS hash of the uploaded content
 */
export const uploadToIpfs = async (content) => {
  // This is a placeholder - implement with your IPFS provider
  throw new Error('IPFS upload not implemented. Implement with Pinata, nft.storage, or other IPFS service.');
  
  /* Example with Pinata:
  
  const API_KEY = 'your-pinata-api-key';
  const API_SECRET = 'your-pinata-api-secret';
  
  let data;
  if (typeof content === 'string') {
    data = JSON.stringify({ text: content });
  } else {
    data = JSON.stringify(content);
  }
  
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'pinata_api_key': API_KEY,
      'pinata_secret_api_key': API_SECRET
    },
    body: data
  });
  
  const result = await response.json();
  if (result.error) {
    throw new Error(`Pinata error: ${result.error}`);
  }
  
  return result.IpfsHash;
  */
};

/**
 * Fetches an image from IPFS
 * @param {string} hash - The IPFS hash of the image
 * @returns {Promise<string>} - URL to the image
 */
export async function getIpfsImageUrl(hash) {
  if (!hash) return null;
  
  // Clean the hash if it has an ipfs:// prefix
  const cleanHash = hash.replace(/^ipfs:\/\//, '');
  
  // Try each gateway until we get a successful response
  for (const gateway of [PRIMARY_GATEWAY, ...FALLBACK_GATEWAYS]) {
    const url = `${gateway}/${cleanHash}`;
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        return url;
      }
    } catch (error) {
      console.warn(`Failed to access image at ${gateway}:`, error.message);
    }
  }
  
  // If no gateway worked, return the primary gateway URL anyway
  // The browser will handle the failure case
  return `${PRIMARY_GATEWAY}/${cleanHash}`;
} 