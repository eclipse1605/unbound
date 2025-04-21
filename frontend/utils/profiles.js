import { ethers } from 'ethers';
import { getReadOnlyContract, getProviderOrSigner } from './contracts';
import { fetchIpfsContent, isIpfsHash } from './ipfs';
import { PROFILE_MANAGER_ADDRESS } from './contractAddresses';
import profileManagerAbi from '../contracts/ProfileManager.json';

export const getProfileManager = async (readOnly = true) => {
  if (readOnly) {
    return getReadOnlyContract(PROFILE_MANAGER_ADDRESS, profileManagerAbi.abi);
  } else {
    const signer = await getProviderOrSigner(true);
    return new ethers.Contract(PROFILE_MANAGER_ADDRESS, profileManagerAbi.abi, signer);
  }
};

export const getProfileData = async (address) => {
  try {
    if (!address || !ethers.utils.isAddress(address)) {
      throw new Error('Invalid address');
    }

    const profileManager = await getProfileManager();
    const profileData = await profileManager.getProfile(address);

    const {
      username,
      bio,
      avatarUrl,
      profileCreated,
      lastUpdated,
      followerCount,
      followingCount
    } = profileData;

    let processedBio = bio;
    
    if (isIpfsHash(bio)) {
      try {
        processedBio = await fetchIpfsContent(bio);
      } catch (error) {
        console.error('Failed to fetch bio content from IPFS:', error);
        processedBio = 'Bio content unavailable';
      }
    }

    let processedAvatar = avatarUrl;
    
    if (isIpfsHash(avatarUrl)) {
      try {
        
        processedAvatar = `https:
      } catch (error) {
        console.error('Failed to process avatar URL:', error);
        processedAvatar = '/default-avatar.png'; 
      }
    }

    return {
      address,
      username: username || address.substring(0, 6) + '...' + address.substring(address.length - 4),
      bio: processedBio || '',
      avatarUrl: processedAvatar || '/default-avatar.png',
      followerCount: parseInt(followerCount) || 0,
      followingCount: parseInt(followingCount) || 0,
      profileCreated: profileCreated ? new Date(parseInt(profileCreated) * 1000) : null,
      lastUpdated: lastUpdated ? new Date(parseInt(lastUpdated) * 1000) : null
    };
  } catch (error) {
    console.error('Error fetching profile data:', error);

    return {
      address,
      username: address.substring(0, 6) + '...' + address.substring(address.length - 4),
      bio: '',
      avatarUrl: '/default-avatar.png',
      followerCount: 0,
      followingCount: 0,
      profileCreated: null,
      lastUpdated: null
    };
  }
};

export const hasProfile = async (address) => {
  try {
    if (!address || !ethers.utils.isAddress(address)) {
      return false;
    }

    const profileManager = await getProfileManager();
    return await profileManager.hasProfile(address);
  } catch (error) {
    console.error('Error checking if user has profile:', error);
    return false;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const { username, bio, avatarUrl } = profileData;
    
    if (!username) {
      throw new Error('Username is required');
    }

    const profileManager = await getProfileManager(false); 
    
    const tx = await profileManager.updateProfile(
      username,
      bio || '',
      avatarUrl || ''
    );
    
    await tx.wait();
    return { success: true, transaction: tx };
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const followUser = async (addressToFollow) => {
  try {
    if (!addressToFollow || !ethers.utils.isAddress(addressToFollow)) {
      throw new Error('Invalid address to follow');
    }

    const profileManager = await getProfileManager(false);
    const tx = await profileManager.follow(addressToFollow);
    await tx.wait();
    
    return { success: true, transaction: tx };
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (addressToUnfollow) => {
  try {
    if (!addressToUnfollow || !ethers.utils.isAddress(addressToUnfollow)) {
      throw new Error('Invalid address to unfollow');
    }

    const profileManager = await getProfileManager(false);
    const tx = await profileManager.unfollow(addressToUnfollow);
    await tx.wait();
    
    return { success: true, transaction: tx };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const isFollowing = async (follower, following) => {
  try {
    if (!follower || !following || 
        !ethers.utils.isAddress(follower) ||
        !ethers.utils.isAddress(following)) {
      return false;
    }

    const profileManager = await getProfileManager();
    return await profileManager.isFollowing(follower, following);
  } catch (error) {
    console.error('Error checking if user is following:', error);
    return false;
  }
};

export const getFollowers = async (address) => {
  try {
    if (!address || !ethers.utils.isAddress(address)) {
      throw new Error('Invalid address');
    }

    const profileManager = await getProfileManager();
    const followers = await profileManager.getFollowers(address);
    
    return followers;
  } catch (error) {
    console.error('Error getting followers:', error);
    return [];
  }
};

export const getFollowing = async (address) => {
  try {
    if (!address || !ethers.utils.isAddress(address)) {
      throw new Error('Invalid address');
    }

    const profileManager = await getProfileManager();
    const following = await profileManager.getFollowing(address);
    
    return following;
  } catch (error) {
    console.error('Error getting following:', error);
    return [];
  }
};

export const getFollowerProfiles = async (address) => {
  try {
    const followerAddresses = await getFollowers(address);

    const followerProfiles = await Promise.all(
      followerAddresses.map(async (followerAddress) => {
        return await getProfileData(followerAddress);
      })
    );
    
    return followerProfiles;
  } catch (error) {
    console.error('Error getting follower profiles:', error);
    return [];
  }
};

export const getFollowingProfiles = async (address) => {
  try {
    const followingAddresses = await getFollowing(address);

    const followingProfiles = await Promise.all(
      followingAddresses.map(async (followingAddress) => {
        return await getProfileData(followingAddress);
      })
    );
    
    return followingProfiles;
  } catch (error) {
    console.error('Error getting following profiles:', error);
    return [];
  }
}; 