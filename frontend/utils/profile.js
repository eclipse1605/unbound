
import { ethers } from 'ethers';
import { pinJSONToIPFS } from './pinata';
import { fetchIpfsContent } from './ipfs';

export const updateProfile = async (profileData) => {
  try {
    
    const { name, bio, profileImage } = profileData;

    const metadata = {
      name: name || '',
      bio: bio || '',
      profileImage: profileImage || '',
      updatedAt: new Date().toISOString()
    };

    const ipfsHash = await pinJSONToIPFS(metadata);

    if (typeof window !== 'undefined') {
      const account = await getCurrentAccount();

      localStorage.setItem(`profile-hash-${account.toLowerCase()}`, ipfsHash);
      localStorage.setItem(`profile-data-${account.toLowerCase()}`, JSON.stringify(metadata));
    }
    
    return { success: true, profileHash: ipfsHash };
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const getCurrentAccount = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not available');
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send('eth_requestAccounts', []);
  return accounts[0];
};

export const formatDisplayAddress = (address) => {
  if (!address) return "Unknown";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const getProfileData = async (address) => {
  if (!address) {
    console.warn("No address provided to getProfileData");
    return getDefaultProfile();
  }
  
  try {

    if (typeof window !== 'undefined') {
      
      const profileData = localStorage.getItem(`profile-data-${address.toLowerCase()}`);
      
      if (profileData) {
        try {
          const parsedData = JSON.parse(profileData);

          if (parsedData) {
            return {
              ...parsedData,
              
              displayName: parsedData.name || formatDisplayAddress(address),
              address: address 
            };
          }
        } catch (e) {
          console.warn("Error parsing profile data from localStorage:", e);
        }
      }

      const ipfsHash = localStorage.getItem(`profile-hash-${address.toLowerCase()}`);
      if (ipfsHash) {
        try {
          const ipfsData = await fetchIpfsContent(ipfsHash);
          if (ipfsData && typeof ipfsData === 'object') {
            
            localStorage.setItem(`profile-data-${address.toLowerCase()}`, JSON.stringify(ipfsData));
            
            return {
              ...ipfsData,
              displayName: ipfsData.name || formatDisplayAddress(address),
              address: address
            };
          }
        } catch (ipfsError) {
          console.warn("Error fetching profile data from IPFS:", ipfsError);
        }
      }
    }

    return {
      ...getDefaultProfile(),
      displayName: formatDisplayAddress(address),
      address: address
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return {
      ...getDefaultProfile(),
      displayName: formatDisplayAddress(address),
      address: address
    };
  }
};

function getDefaultProfile() {
  return {
    name: '',
    bio: '',
    profileImage: '',
    updatedAt: '',
    displayName: 'Unknown User'
  };
}
