import { ethers } from 'ethers';
import CommentManagerABI from '../abis/CommentManager.json';
import { getProvider, setupNetwork } from './ethereum';
import addresses from '../contract-addresses.json';

const getCommentManagerContract = (writable = false) => {
  if (writable) {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('Ethereum provider not available');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider.getSigner().then(signer => {
      return new ethers.Contract(addresses.commentManager, CommentManagerABI.abi, signer);
    });
  } else {
    const provider = getProvider();
    return new ethers.Contract(addresses.commentManager, CommentManagerABI.abi, provider);
  }
};

export async function fetchCommentsForSpark(sparkId) {
  try {
    
    const numericSparkId = Number(sparkId);
    if (isNaN(numericSparkId)) throw new Error('Invalid spark ID');
    
    const contract = await getCommentManagerContract();

    const commentIds = await contract.getCommentsForSpark(numericSparkId);
    
    if (!commentIds || commentIds.length === 0) return [];

    const commentPromises = commentIds.map(async (id) => {
      const comment = await contract.getComment(id);

      let isLiked = false;
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          isLiked = await contract.hasLikedComment(id, accounts[0]);
        }
      }
      
      return {
        id: Number(id),
        sparkId: Number(comment.sparkId),
        author: comment.author,
        content: comment.content,
        parentId: comment.parentId > 0 ? Number(comment.parentId) : null,
        timestamp: Number(comment.timestamp),
        likes: Number(comment.likes),
        liked: isLiked
      };
    });
    
    let comments = await Promise.all(commentPromises);

    const commentMap = {};
    comments.forEach(comment => {
      comment.replies = [];
      commentMap[comment.id] = comment;
    });

    const rootComments = [];
    comments.forEach(comment => {
      if (comment.parentId) {
        
        if (commentMap[comment.parentId]) {
          commentMap[comment.parentId].replies.push(comment);
        }
      } else {
        
        rootComments.push(comment);
      }
    });

    const sortByTimestamp = (a, b) => b.timestamp - a.timestamp;
    
    rootComments.sort(sortByTimestamp);
    rootComments.forEach(comment => {
      if (comment.replies.length > 0) {
        comment.replies.sort(sortByTimestamp);
      }
    });
    
    return rootComments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

export async function createComment(sparkId, content, parentId = 0) {
  try {
    
    await setupNetwork();

    const contract = await getCommentManagerContract(true);

    const tx = await contract.createComment(sparkId, content, parentId);

    const receipt = await tx.wait();
    
    return receipt;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

export async function likeComment(commentId) {
  try {
    await setupNetwork();
    const contract = await getCommentManagerContract(true);
    const tx = await contract.likeComment(commentId);
    return await tx.wait();
  } catch (error) {
    console.error('Error liking comment:', error);
    throw error;
  }
}

export async function unlikeComment(commentId) {
  try {
    await setupNetwork();
    const contract = await getCommentManagerContract(true);
    const tx = await contract.unlikeComment(commentId);
    return await tx.wait();
  } catch (error) {
    console.error('Error unliking comment:', error);
    throw error;
  }
}

export async function deleteComment(commentId) {
  try {
    await setupNetwork();
    const contract = await getCommentManagerContract(true);
    const tx = await contract.deleteComment(commentId);
    return await tx.wait();
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

export async function hasLikedComment(commentId, userAddress) {
  try {
    const contract = await getCommentManagerContract();
    return await contract.hasLikedComment(commentId, userAddress);
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
} 