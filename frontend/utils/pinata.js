

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

function validatePinataConfig() {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    throw new Error('Pinata API keys not configured. Please set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_API_KEY in your environment.');
  }
}

export async function pinJSONToIPFS(jsonBody) {
  validatePinataConfig();
  
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
      body: JSON.stringify(jsonBody),
    });
    
    if (!res.ok) {
      const error = await res.text();
      console.error('Pinata JSON upload failed:', error);
      throw new Error(`Pinata upload failed: ${error}`);
    }
    
    const data = await res.json();
    
    if (!data.IpfsHash) {
      throw new Error('No IPFS hash received from Pinata');
    }
    
    console.log('Successfully pinned JSON to IPFS:', data.IpfsHash);
    return data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
}

export async function pinFileToIPFS(file) {
  validatePinataConfig();
  
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
      body: formData,
    });
    
    if (!res.ok) {
      const error = await res.text();
      console.error('Pinata file upload failed:', error);
      throw new Error(`Pinata file upload failed: ${error}`);
    }
    
    const data = await res.json();
    
    if (!data.IpfsHash) {
      throw new Error('No IPFS hash received from Pinata');
    }
    
    console.log('Successfully pinned file to IPFS:', data.IpfsHash);
    return data.IpfsHash;
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    throw error;
  }
}
