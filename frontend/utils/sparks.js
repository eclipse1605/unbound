import { ethers } from 'ethers';
import { getReadOnlyContract, getProviderOrSigner } from './ethereum';
import addresses from '../contract-addresses.json';
import { fetchIpfsContent, isIpfsHash } from './ipfs';
import { getProfileData } from './profile';
import sparkRegistryAbiJson from '../abis/SparkRegistry.json';

const sparkRegistryAbi = sparkRegistryAbiJson.abi;

export const getSparkManager = async (readOnly = true) => {
  try {
    
    if (!addresses.sparkRegistry) {
      console.error('Spark Registry address not found in contract addresses');
      throw new Error('Spark Registry address configuration missing');
    }

    if (!Array.isArray(sparkRegistryAbi)) {
      console.error('Invalid ABI format:', sparkRegistryAbi);
      throw new Error('ABI is not an array. Check the SparkRegistry.json file format.');
    }
    
    if (readOnly) {
      return getReadOnlyContract(addresses.sparkRegistry, sparkRegistryAbi);
    } else {
      const signer = await getProviderOrSigner(true);
      return new ethers.Contract(addresses.sparkRegistry, sparkRegistryAbi, signer);
    }
  } catch (error) {
    console.error('Error getting SparkManager:', error);
    throw error;
  }
};

export const createSpark = async (contentHash, contentType, parentId = '0') => {
  try {
    if (!contentHash) {
      throw new Error('Content hash is required');
    }

    const sparkManager = await getSparkManager(false);
    
    const tx = await sparkManager.createSpark(
      contentHash,
      contentType,
      parentId
    );
    
    await tx.wait();
    return { success: true, transaction: tx };
  } catch (error) {
    console.error('Error creating spark:', error);
    throw error;
  }
};

export const deleteSpark = async (sparkId) => {
  try {
    if (!sparkId) {
      throw new Error('Spark ID is required');
    }

    const sparkManager = await getSparkManager(false);
    const tx = await sparkManager.deleteSpark(sparkId);
    await tx.wait();
    
    return { success: true, transaction: tx };
  } catch (error) {
    console.error('Error deleting spark:', error);
    throw error;
  }
};

export const likeSpark = async (sparkId) => {
  try {
    if (sparkId === undefined || sparkId === null) {
      throw new Error('Spark ID is required');
    }

    console.log(`Attempting to like spark with ID: ${sparkId}`);

    const formattedSparkId = typeof sparkId === 'string' ? sparkId : sparkId.toString();
    
    const sparkManager = await getSparkManager(false);

    try {
      
      const provider = await getProviderOrSigner(true);
      const address = await provider.getAddress();
      
      const alreadyLiked = await sparkManager.hasLiked(address, formattedSparkId);
      if (alreadyLiked) {
        console.log(`Spark ${sparkId} is already liked by ${address}`);
        return { success: true, alreadyLiked: true };
      }
    } catch (checkError) {
      console.warn("Error checking if already liked:", checkError);
      
    }

    console.log("Sending like transaction...");
    const tx = await sparkManager.likeSpark(formattedSparkId);
    console.log("Transaction sent:", tx.hash);

    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    
    return { success: true, transaction: tx, receipt };
  } catch (error) {
    console.error('Error liking spark:', error);

    let errorMessage = error.message || 'Unknown error occurred';
    
    if (errorMessage.includes('user rejected')) {
      errorMessage = 'Transaction rejected by user';
    } else if (errorMessage.includes('already liked')) {
      errorMessage = 'You have already liked this spark';
    } else if (errorMessage.includes('gas')) {
      errorMessage = 'Gas estimation failed. The transaction might fail';
    }
    
    throw new Error(errorMessage);
  }
};

export const unlikeSpark = async (sparkId) => {
  try {
    if (sparkId === undefined || sparkId === null) {
      throw new Error('Spark ID is required');
    }

    console.log(`Attempting to unlike spark with ID: ${sparkId}`);

    const formattedSparkId = typeof sparkId === 'string' ? sparkId : sparkId.toString();
    
    const sparkManager = await getSparkManager(false);

    try {
      
      const provider = await getProviderOrSigner(true);
      const address = await provider.getAddress();
      
      const isLiked = await sparkManager.hasLiked(address, formattedSparkId);
      if (!isLiked) {
        console.log(`Spark ${sparkId} is not liked by ${address}, cannot unlike`);
        return { success: true, notLiked: true };
      }
    } catch (checkError) {
      console.warn("Error checking if liked:", checkError);
      
    }

    console.log("Sending unlike transaction...");
    const tx = await sparkManager.unlikeSpark(formattedSparkId);
    console.log("Transaction sent:", tx.hash);

    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    
    return { success: true, transaction: tx, receipt };
  } catch (error) {
    console.error('Error unliking spark:', error);

    let errorMessage = error.message || 'Unknown error occurred';
    
    if (errorMessage.includes('user rejected')) {
      errorMessage = 'Transaction rejected by user';
    } else if (errorMessage.includes('not liked')) {
      errorMessage = 'You have not liked this spark yet';
    } else if (errorMessage.includes('gas')) {
      errorMessage = 'Gas estimation failed. The transaction might fail';
    }
    
    throw new Error(errorMessage);
  }
};

export const resparkSpark = async (sparkId, contentHash = '') => {
  try {
    if (!sparkId) {
      throw new Error('Spark ID is required');
    }

    const sparkManager = await getSparkManager(false);
    const tx = await sparkManager.respark(sparkId, contentHash);
    await tx.wait();
    
    return { success: true, transaction: tx };
  } catch (error) {
    console.error('Error resparking:', error);
    throw error;
  }
};

export const hasLikedSpark = async (sparkId, address) => {
  try {
    if (!sparkId || !address || !ethers.utils.isAddress(address)) {
      return false;
    }

    const sparkManager = await getSparkManager();
    return await sparkManager.hasLiked(address, sparkId);
  } catch (error) {
    console.error('Error checking if user has liked spark:', error);
    return false;
  }
};

const processSparkData = async (sparkData, currentUserAddress) => {
  try {
    // Log the actual structure of sparkData to debug
    console.log("[processSparkData] Raw sparkData:", JSON.stringify(sparkData));
    
    // The Solidity contract returns these fields in the Spark struct
    // Map them correctly based on the contract's field names
    const author = sparkData.author;
    const content = sparkData.content;
    const mediaHash = sparkData.mediaHash; // This is what we need
    const timestamp = sparkData.timestamp;
    const likes = sparkData.likes;
    const rebounds = sparkData.rebounds;
    const isDeleted = sparkData.isDeleted;
    
    // For backwards compatibility
    const id = sparkData.id || '0';
    const contentType = 'text';
    const parentId = sparkData.parentId || '0';
    const likeCount = likes;
    const responseCount = rebounds;
    
    console.log("[processSparkData] Extracted mediaHash:", mediaHash);
    
    const sparkId = id.toString();

    const authorProfile = await getProfileData(author);

    const hasLiked = currentUserAddress ? 
      await hasLikedSpark(sparkId, currentUserAddress) : false;

    // Check if the content field is an IPFS hash and fetch it if needed
    let displayContent = content;
    if (isIpfsHash(content)) {
      try {
        displayContent = await fetchIpfsContent(content);
      } catch (error) {
        console.error(`Failed to fetch content for spark ${sparkId}:`, error);
        displayContent = 'Content unavailable';
      }
    }
    
    return {
      id: sparkId,
      author: {
        address: author,
        username: authorProfile.username,
        avatarUrl: authorProfile.avatarUrl
      },
      content: displayContent,
      contentType: contentType,
      mediaHash: mediaHash, // <-- Pass mediaHash to frontend
      timestamp: new Date(parseInt(timestamp) * 1000),
      parentId: parentId.toString(),
      isDeleted: isDeleted,
      likeCount: parseInt(likeCount),
      responseCount: parseInt(responseCount),
      hasLiked: hasLiked
    };
  } catch (error) {
    console.error('Error processing spark data:', error);
    
    return {
      id: sparkData.id?.toString() || '0',
      author: {
        address: sparkData.author || ethers.constants.AddressZero,
        username: 'Unknown',
        avatarUrl: '/default-avatar.png'
      },
      content: 'Error loading content',
      contentType: 'text',
      mediaHash: sparkData.mediaHash || '', // <-- Add fallback for error case
      timestamp: sparkData.timestamp ? new Date(parseInt(sparkData.timestamp) * 1000) : new Date(),
      parentId: sparkData.parentId?.toString() || '0',
      isDeleted: sparkData.isDeleted || false,
      likeCount: parseInt(sparkData.likes) || 0,
      responseCount: parseInt(sparkData.rebounds) || 0,
      hasLiked: false
    };
  }
};

export const getSpark = async (sparkId, currentUserAddress = null) => {
  try {
    if (!sparkId) {
      throw new Error('Spark ID is required');
    }

    const sparkManager = await getSparkManager();
    const sparkData = await sparkManager.getSpark(sparkId);

    return await processSparkData(sparkData, currentUserAddress);
  } catch (error) {
    console.error(`Error fetching spark ${sparkId}:`, error);
    return null;
  }
};

export const getFeed = async (limit = 20, offset = 0, currentUserAddress = null) => {
  try {
    const sparkManager = await getSparkManager();

    const sparkIds = await sparkManager.getFeed(limit, offset);

    const sparkPromises = sparkIds.map(async (id) => {
      try {
        return await getSpark(id.toString(), currentUserAddress);
      } catch (error) {
        console.error(`Error processing spark ${id}:`, error);
        return null;
      }
    });

    const sparks = await Promise.all(sparkPromises);

    return sparks
      .filter(spark => spark !== null && !spark.isDeleted)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error fetching feed:', error);
    return [];
  }
};

export const getUserSparks = async (userAddress, limit = 20, offset = 0, currentUserAddress = null) => {
  try {
    if (!userAddress || !ethers.utils.isAddress(userAddress)) {
      throw new Error('Valid user address is required');
    }
    
    const sparkManager = await getSparkManager();

    const sparkIds = await sparkManager.getUserSparks(userAddress, limit, offset);

    const sparkPromises = sparkIds.map(async (id) => {
      try {
        return await getSpark(id.toString(), currentUserAddress);
      } catch (error) {
        console.error(`Error processing spark ${id}:`, error);
        return null;
      }
    });

    const sparks = await Promise.all(sparkPromises);

    return sparks
      .filter(spark => spark !== null && !spark.isDeleted)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error(`Error fetching sparks for user ${userAddress}:`, error);
    return [];
  }
};

export const getSparkReplies = async (sparkId, currentUserAddress = null) => {
  try {
    if (!sparkId) {
      throw new Error('Spark ID is required');
    }
    
    const sparkManager = await getSparkManager();

    const replyIds = await sparkManager.getReplies(sparkId);

    const replyPromises = replyIds.map(async (id) => {
      try {
        return await getSpark(id.toString(), currentUserAddress);
      } catch (error) {
        console.error(`Error processing reply ${id}:`, error);
        return null;
      }
    });

    const replies = await Promise.all(replyPromises);

    return replies
      .filter(reply => reply !== null && !reply.isDeleted)
      .sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error(`Error fetching replies for spark ${sparkId}:`, error);
    return [];
  }
};

export const getSparkLikers = async (sparkId) => {
  try {
    if (!sparkId) {
      throw new Error('Spark ID is required');
    }
    
    const sparkManager = await getSparkManager();
    return await sparkManager.getLikers(sparkId);
  } catch (error) {
    console.error(`Error fetching likers for spark ${sparkId}:`, error);
    return [];
  }
}; 