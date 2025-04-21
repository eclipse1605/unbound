
import { ethers } from 'ethers';
import { getReadOnlyContract, getProviderOrSigner } from './ethereum';
import { getSparkManager } from './sparks';
import addresses from '../contract-addresses.json';
import reboundManagerAbiJson from '../abis/ReboundManager.json';

const reboundManagerAbi = reboundManagerAbiJson.abi;

export const getReboundManager = async (readOnly = false) => {
  try {
    
    if (!Array.isArray(reboundManagerAbi)) {
      console.error('Invalid ABI format:', reboundManagerAbi);
      throw new Error('ABI is not an array. Check the ReboundManager.json file format.');
    }
    
    if (readOnly) {
      return getReadOnlyContract(addresses.reboundManager, reboundManagerAbi);
    }
    
    const signerOrProvider = await getProviderOrSigner(true);
    return new ethers.Contract(addresses.reboundManager, reboundManagerAbi, signerOrProvider);
  } catch (error) {
    console.error('Error getting ReboundManager contract:', error);
    throw error;
  }
};

export const createRebound = async (sparkId, comment) => {
  try {
    // Check if sparkId is valid (can be 0, but not undefined/null)
    if (sparkId === undefined || sparkId === null) {
      console.error('Spark ID is required to create a rebound');
      throw new Error('Spark ID is required');
    }
    
    // Additional debug logging to help troubleshoot
    console.log(`createRebound called with sparkId: ${sparkId} (${typeof sparkId})`);
    
    // Validate comment
    if (!comment || comment.trim() === '') {
      console.warn('Empty comment for rebound, using default');
      comment = 'No comment';
    }

    console.log(`Creating rebound for sparkId: ${sparkId} with comment: ${comment}`);

    // Format the sparkId to handle various input types
    const formattedSparkId = typeof sparkId === 'string' ? sparkId : sparkId.toString();

    // Skip the exists check since it appears the contract doesn't have this method
    // Instead, we'll let the contract handle the validation
    
    const reboundManager = await getReboundManager(false);
    
    console.log("Sending transaction to create rebound...");
    
    // Based on the ABI, createRebound only takes two parameters: originalSparkId and comment
    const tx = await reboundManager.createRebound(formattedSparkId, comment);
    console.log("Transaction sent:", tx.hash);
    
    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);

    let reboundId = null;
    try {
      const event = receipt.events?.find(e => e.event === 'ReboundCreated');
      reboundId = event?.args?.reboundId?.toString();
      console.log(`New rebound created with ID: ${reboundId}`);
    } catch (eventError) {
      console.warn('Could not extract rebound ID from events:', eventError);
    }
    
    return { success: true, transaction: tx, receipt, reboundId };
  } catch (error) {
    console.error('Error creating rebound:', error);

    let errorMessage = error.message || 'Unknown error occurred';
    
    if (errorMessage.includes('user rejected')) {
      errorMessage = 'Transaction rejected by user';
    } else if (errorMessage.includes('gas')) {
      errorMessage = 'Gas estimation failed. The transaction might fail';
    } else if (errorMessage.includes('does not exist')) {
      errorMessage = error.message; 
    }
    
    throw new Error(errorMessage);
  }
};

export const deleteRebound = async (reboundId) => {
  try {
    if (!reboundId) {
      throw new Error('Rebound ID is required');
    }
    
    const reboundManager = await getReboundManager(false);
    const tx = await reboundManager.deleteRebound(reboundId);
    const receipt = await tx.wait();
    
    return { 
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('Error deleting rebound:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

export const likeRebound = async (reboundId) => {
  try {
    if (!reboundId) {
      throw new Error('Rebound ID is required');
    }
    
    console.log(`Attempting to like rebound with ID: ${reboundId}`);
    
    const reboundManager = await getReboundManager(false);

    try {
      const provider = await getProviderOrSigner(true);
      const userAddress = await provider.getAddress();
      
      const alreadyLiked = await reboundManager.hasLikedRebound(reboundId, userAddress);
      if (alreadyLiked) {
        console.log(`Rebound ${reboundId} is already liked by ${userAddress}`);
        return { 
          success: true, 
          alreadyLiked: true,
          message: "You have already liked this rebound"
        };
      }
    } catch (checkError) {
      console.warn("Error checking if rebound is already liked:", checkError);
    }
    
    console.log("Sending likeRebound transaction...");
    const tx = await reboundManager.likeRebound(reboundId);
    console.log("Transaction sent:", tx.hash);
    
    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    
    return { 
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('Error liking rebound:', error);

    let errorMessage = error.message || 'Unknown error occurred';
    
    if (errorMessage.includes('user rejected')) {
      errorMessage = 'Transaction rejected by user';
    } else if (errorMessage.includes('already liked')) {
      errorMessage = 'You have already liked this rebound';
    } else if (errorMessage.includes('gas')) {
      errorMessage = 'Gas estimation failed. The transaction might fail';
    } else if (errorMessage.includes('not exist')) {
      errorMessage = 'This rebound does not exist';
    }
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
};

export const unlikeRebound = async (reboundId) => {
  try {
    if (!reboundId) {
      throw new Error('Rebound ID is required');
    }
    
    console.log(`Attempting to unlike rebound with ID: ${reboundId}`);
    
    const reboundManager = await getReboundManager(false);

    try {
      const provider = await getProviderOrSigner(true);
      const userAddress = await provider.getAddress();
      
      const hasLiked = await reboundManager.hasLikedRebound(reboundId, userAddress);
      if (!hasLiked) {
        console.log(`Rebound ${reboundId} is not liked by ${userAddress}, cannot unlike`);
        return { 
          success: true, 
          notLiked: true,
          message: "You haven't liked this rebound yet"
        };
      }
    } catch (checkError) {
      console.warn("Error checking if rebound is liked:", checkError);
    }
    
    console.log("Sending unlikeRebound transaction...");
    const tx = await reboundManager.unlikeRebound(reboundId);
    console.log("Transaction sent:", tx.hash);
    
    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    
    return { 
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('Error unliking rebound:', error);

    let errorMessage = error.message || 'Unknown error occurred';
    
    if (errorMessage.includes('user rejected')) {
      errorMessage = 'Transaction rejected by user';
    } else if (errorMessage.includes('not liked')) {
      errorMessage = 'You have not liked this rebound';
    } else if (errorMessage.includes('gas')) {
      errorMessage = 'Gas estimation failed. The transaction might fail';
    } else if (errorMessage.includes('not exist')) {
      errorMessage = 'This rebound does not exist';
    }
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
};

export const hasLikedRebound = async (reboundId, address) => {
  try {
    if (!reboundId) {
      throw new Error('Rebound ID is required');
    }
    
    const reboundManager = await getReboundManager(true);
    let userAddress = address;
    
    if (!userAddress) {
      const signer = await getProviderOrSigner(true);
      userAddress = await signer.getAddress();
    }
    
    return await reboundManager.hasLikedRebound(reboundId, userAddress);
  } catch (error) {
    console.error('Error checking if user has liked rebound:', error);
    return false;
  }
};

export const processReboundData = async (rawRebound, includeHasLiked = true) => {
  try {
    if (!rawRebound) return null;
    
    const processedRebound = {
      id: rawRebound.id.toString(),
      author: rawRebound.author,
      contentURI: rawRebound.contentURI,
      mediaHash: rawRebound.contentURI, // Add mediaHash property mapping to contentURI
      parentType: rawRebound.parentType,
      parentId: rawRebound.parentId.toString(),
      timestamp: new Date(rawRebound.timestamp.toNumber() * 1000),
      likeCount: rawRebound.likeCount.toNumber(),
      isDeleted: rawRebound.isDeleted
    };
    
    // Debug logging to verify media hash
    console.log(`Processing rebound ${processedRebound.id} with mediaHash: ${processedRebound.mediaHash}`);
    
    if (includeHasLiked) {
      processedRebound.hasLiked = await hasLikedRebound(processedRebound.id);
    }
    
    return processedRebound;
  } catch (error) {
    console.error('Error processing rebound data:', error);
    return null;
  }
};

export const getRebound = async (reboundId) => {
  try {
    if (!reboundId) {
      throw new Error('Rebound ID is required');
    }
    
    const reboundManager = await getReboundManager(true);
    const rebound = await reboundManager.getReboundById(reboundId);
    
    return await processReboundData(rebound);
  } catch (error) {
    console.error('Error fetching rebound:', error);
    return null;
  }
};

export const getUserRebounds = async (userAddress, limit = 20, offset = 0) => {
  try {
    if (!userAddress) {
      throw new Error('User address is required');
    }
    
    const reboundManager = await getReboundManager(true);
    const rebounds = await reboundManager.getReboundsByAuthor(userAddress, limit, offset);
    
    const processedRebounds = await Promise.all(
      rebounds.map(rebound => processReboundData(rebound))
    );
    
    return processedRebounds.filter(rebound => rebound && !rebound.isDeleted);
  } catch (error) {
    console.error('Error fetching user rebounds:', error);
    return [];
  }
};

export const getReboundsForParent = async (parentType, parentId, limit = 20, offset = 0) => {
  try {
    if (!parentType || !parentId) {
      throw new Error('Parent type and ID are required');
    }
    
    const reboundManager = await getReboundManager(true);
    const rebounds = await reboundManager.getReboundsByParent(parentType, parentId, limit, offset);
    
    const processedRebounds = await Promise.all(
      rebounds.map(rebound => processReboundData(rebound))
    );
    
    return processedRebounds.filter(rebound => rebound && !rebound.isDeleted);
  } catch (error) {
    console.error('Error fetching rebounds for parent:', error);
    return [];
  }
};

export const getReboundLikers = async (reboundId, limit = 20, offset = 0) => {
  try {
    if (!reboundId) {
      throw new Error('Rebound ID is required');
    }
    
    const reboundManager = await getReboundManager(true);
    const likers = await reboundManager.getLikersByReboundId(reboundId, limit, offset);
    
    return likers;
  } catch (error) {
    console.error('Error fetching rebound likers:', error);
    return [];
  }
};

export const getRecentRebounds = async (limit = 20, offset = 0) => {
  try {
    const reboundManager = await getReboundManager(true);
    const rebounds = await reboundManager.getRecentRebounds(limit, offset);
    
    const processedRebounds = await Promise.all(
      rebounds.map(rebound => processReboundData(rebound))
    );
    
    return processedRebounds.filter(rebound => rebound && !rebound.isDeleted);
  } catch (error) {
    console.error('Error fetching recent rebounds:', error);
    return [];
  }
};

export const getTrendingRebounds = async (limit = 20, offset = 0) => {
  try {
    const reboundManager = await getReboundManager(true);
    const rebounds = await reboundManager.getTrendingRebounds(limit, offset);
    
    const processedRebounds = await Promise.all(
      rebounds.map(rebound => processReboundData(rebound))
    );
    
    return processedRebounds.filter(rebound => rebound && !rebound.isDeleted);
  } catch (error) {
    console.error('Error fetching trending rebounds:', error);
    return [];
  }
};
