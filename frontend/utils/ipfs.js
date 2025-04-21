

const PRIMARY_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https:

const FALLBACK_GATEWAYS = [
  'https:
  'https:
  'https:
  'https:
  ...(process.env.NEXT_PUBLIC_IPFS_FALLBACK_GATEWAYS || '')
    .split(',')
    .filter(Boolean)
    .map(gateway => gateway.trim())
];

const IPFS_GATEWAY = 'https:

export function isIpfsHash(str) {
    
    if (!str || typeof str !== 'string') return false;

    const cleanedStr = str.trim().replace('ipfs:

    const cid0Regex = /^Qm[a-zA-Z0-9]{44}$/;
    const cid1Regex = /^b[a-zA-Z0-9]{58,}$/;

    const genericHashRegex = /^[A-Za-z0-9]{32,}$/;
    
    console.log("Checking if potential IPFS hash:", cleanedStr);
    const result = cid0Regex.test(cleanedStr) || cid1Regex.test(cleanedStr) || genericHashRegex.test(cleanedStr);
    console.log("isIpfsHash result:", result);
    
    return result;
}

export const getIpfsUrl = (hash) => {
  if (!hash) return null;

  if (hash.startsWith('ipfs:
    hash = hash.replace('ipfs:
  }
  
  return `${IPFS_GATEWAY}${hash}`;
};

export async function fetchIpfsContent(hash) {
    if (!hash) {
        console.error("Empty hash provided to fetchIpfsContent");
        return "No content available";
    }

    const cleanHash = hash.trim().replace('ipfs:
    console.log("Fetching IPFS content for hash:", cleanHash);

    const gateways = [
        `https:
        `https:
        `https:
        `https:
        `https:
    ];

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
                    
                    if (data.content) return data.content;
                    if (data.text) return data.text;
                    if (data.message) return data.message;
                    if (data.body) return data.body;
                    if (data.data) return typeof data.data === 'string' ? data.data : JSON.stringify(data.data);

                    return JSON.stringify(data);
                } else if (typeof data === 'string') {
                    return data;
                } else {
                    return "Unknown content format";
                }
            } catch (jsonError) {
                
                const text = await res.text();
                if (text) return text;
            }
        } catch (error) {
            console.error(`Error fetching from gateway ${gateway}:`, error);
            
        }
    }

    console.error("All IPFS gateways failed for hash:", cleanHash);
    return "Content currently unavailable";
}

export const uploadToIpfs = async (content) => {
  
  throw new Error('IPFS upload not implemented. Implement with Pinata, nft.storage, or other IPFS service.');

};

export async function getIpfsImageUrl(hash) {
  if (!hash) return null;

  const cleanHash = hash.replace(/^ipfs:\/\

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

  return `${PRIMARY_GATEWAY}/${cleanHash}`;
} 