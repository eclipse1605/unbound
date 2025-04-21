import { ethers } from 'ethers';
import { getProvider } from './ethereum';
import addresses from '../contract-addresses.json';

import sparkRegistryABIFull from '../abis/SparkRegistry.json';
import reboundManagerABIFull from '../abis/ReboundManager.json';
import socialGraphABIFull from '../abis/SocialGraph.json';
import interactionTrackerABIFull from '../abis/InteractionTracker.json';

const SparkRegistryABI = sparkRegistryABIFull.abi;
const ReboundManagerABI = reboundManagerABIFull.abi;
const SocialGraphABI = socialGraphABIFull.abi;
const InteractionTrackerABI = interactionTrackerABIFull.abi;

const contractAddresses = {
  SparkRegistry: addresses.sparkRegistry,
  ReboundManager: addresses.reboundManager,
  SocialGraph: addresses.socialGraph,
  InteractionTracker: addresses.interactionTracker
};

function getContracts() {
  try {
    console.log("Getting contract instances with addresses:", contractAddresses);
    const provider = getProvider();

    if (!Array.isArray(SparkRegistryABI)) {
      console.error("SparkRegistryABI is not an array:", SparkRegistryABI);
      throw new Error("SparkRegistryABI is not valid");
    }
    
    if (!Array.isArray(ReboundManagerABI)) {
      console.error("ReboundManagerABI is not an array:", ReboundManagerABI);
      throw new Error("ReboundManagerABI is not valid");
    }

    if (!contractAddresses.SparkRegistry || !ethers.isAddress(contractAddresses.SparkRegistry)) {
      console.error("Invalid SparkRegistry address:", contractAddresses.SparkRegistry);
      throw new Error("SparkRegistry address is not valid");
    }
    
    if (!contractAddresses.ReboundManager || !ethers.isAddress(contractAddresses.ReboundManager)) {
      console.error("Invalid ReboundManager address:", contractAddresses.ReboundManager);
      throw new Error("ReboundManager address is not valid");
    }

    const sparkRegistry = new ethers.Contract(
      contractAddresses.SparkRegistry, 
      SparkRegistryABI, 
      provider
    );
    
    const reboundManager = new ethers.Contract(
      contractAddresses.ReboundManager, 
      ReboundManagerABI, 
      provider
    );
    
    const socialGraph = new ethers.Contract(
      contractAddresses.SocialGraph, 
      SocialGraphABI, 
      provider
    );
    
    const interactionTracker = new ethers.Contract(
      contractAddresses.InteractionTracker, 
      InteractionTrackerABI, 
      provider
    );
    
    return { sparkRegistry, reboundManager, socialGraph, interactionTracker };
  } catch (error) {
    console.error("Error creating contract instances:", error);
    throw new Error("Failed to initialize contracts: " + error.message);
  }
}

export async function fetchSparks(limit = 20, skip = 0) {
  const { sparkRegistry } = getContracts();

  const totalSparks = await sparkRegistry.getSparkCount();

  const startIndex = Math.max(0, Number(totalSparks) - skip - limit);
  const endIndex = Math.max(0, Number(totalSparks) - skip);
  
  const sparkPromises = [];
  const indices = [];
  
  for (let i = startIndex; i < endIndex; i++) {
    sparkPromises.push(sparkRegistry.getSpark(i));
    indices.push(i); 
  }
  
  const sparks = await Promise.all(sparkPromises);

  return sparks
    .map((spark, index) => {
      if (spark.isDeleted) return null;
      return {
        
        id: indices[index],
        author: spark.author,
        content: spark.content,
        mediaHash: spark.mediaHash,
        timestamp: Number(spark.timestamp),
        likes: Number(spark.likes),
        rebounds: Number(spark.rebounds),
        isDeleted: spark.isDeleted
      };
    })
    .filter(s => s !== null)
    .reverse(); 
}

export async function fetchUserSparks(userAddress, limit = 20, skip = 0) {
  const { sparkRegistry } = getContracts();

  const sparkIds = await sparkRegistry.getUserSparks(userAddress);

  const startIndex = Math.max(0, sparkIds.length - skip - limit);
  const endIndex = Math.max(0, sparkIds.length - skip);
  const paginatedIds = sparkIds.slice(startIndex, endIndex);
  
  const sparkPromises = [];
  const idMapping = [];

  for (let i = 0; i < paginatedIds.length; i++) {
    const id = Number(paginatedIds[i]);
    sparkPromises.push(sparkRegistry.getSpark(id));
    idMapping.push(id);
  }
  
  const sparks = await Promise.all(sparkPromises);
  
  return sparks
    .map((spark, index) => {
      if (spark.isDeleted) return null;
      return {
        id: idMapping[index], 
        author: userAddress,
        content: spark.content,
        mediaHash: spark.mediaHash,
        timestamp: Number(spark.timestamp),
        likes: Number(spark.likes),
        rebounds: Number(spark.rebounds),
        isDeleted: false
      };
    })
    .filter(s => s !== null)
    .reverse();
}

export async function fetchSparkById(sparkId) {
  const { sparkRegistry } = getContracts();
  const spark = await sparkRegistry.getSpark(sparkId);

  return {
    id: Number(sparkId),
    author: spark.author,
    content: spark.content,
    mediaHash: spark.mediaHash,
    timestamp: Number(spark.timestamp),
    likes: Number(spark.likes),
    rebounds: Number(spark.rebounds),
    isDeleted: spark.isDeleted
  };
}

export async function fetchRebounds(sparkId, limit = 20, skip = 0) {
  const { reboundManager } = getContracts();
  
  console.log("Fetching rebounds for spark ID:", sparkId, "type:", typeof sparkId);

  const numericSparkId = Number(sparkId);
  if (isNaN(numericSparkId)) {
    console.error("Invalid spark ID for fetching rebounds:", sparkId);
    return [];
  }

  const reboundIds = await reboundManager.getReboundSparkIds(numericSparkId);

  const startIndex = Math.max(0, reboundIds.length - skip - limit);
  const endIndex = Math.max(0, reboundIds.length - skip);
  const paginatedIds = reboundIds.slice(startIndex, endIndex);
  
  const reboundPromises = paginatedIds.map(async (id) => {
    
    const reboundId = Number(id);
    const originalId = Number(await reboundManager.getOriginalSparkId(reboundId));
    const spark = await fetchSparkById(reboundId);
    
    return {
      id: reboundId,
      originalSparkId: originalId,
      rebounder: spark.author,
      comment: spark.content,
      timestamp: spark.timestamp
    };
  });
  
  return Promise.all(reboundPromises);
}

export async function fetchUserOrbitData(userAddress) {
  const { socialGraph } = getContracts();
  
  const [orbits, orbiters] = await Promise.all([
    socialGraph.getFollowing(userAddress),
    socialGraph.getFollowers(userAddress)
  ]);
  
  return {
    orbits: orbits,
    orbiters: orbiters
  };
}

export async function isUserOrbiting(userAddress, targetAddress) {
  const { socialGraph } = getContracts();
  return socialGraph.isFollowing(userAddress, targetAddress);
}

export async function fetchUserSparksAndRebounds(userAddress, limit = 20, skip = 0) {
  try {
    
    const provider = getProvider();

    const minimalAbi = [
      "function getSparkCount() external view returns (uint256)",
      "function getSpark(uint256 sparkId) external view returns (tuple(address author, string content, string mediaHash, uint256 timestamp, uint256 likes, uint256 rebounds, bool isDeleted))",
      "function getSparksByAuthor(address author) external view returns (uint256[])",
      "function getReboundsByUser(address user) external view returns (uint256[])",
      "function getRebound(uint256 reboundId) external view returns (tuple(address rebounder, uint256 originalSparkId, string comment, uint256 timestamp))",
      "function getOriginalSparkId(uint256 reboundId) external view returns (uint256)"
    ];
    
    const sparkRegistry = new ethers.Contract(
      contractAddresses.SparkRegistry, 
      minimalAbi, 
      provider
    );
    
    const reboundManager = new ethers.Contract(
      contractAddresses.ReboundManager, 
      minimalAbi, 
      provider
    );
  
  console.log("Fetching content for user:", userAddress);

    let sparkIds = [];
    let reboundIds = [];
    
    try {
      sparkIds = await sparkRegistry.getSparksByAuthor(userAddress);
  console.log("Found sparkIds:", sparkIds.map(id => Number(id)));
    } catch (error) {
      console.error("Error fetching user's sparks:", error);
    }
    
    try {
      reboundIds = await reboundManager.getReboundsByUser(userAddress);
  console.log("Found reboundIds:", reboundIds.map(id => Number(id)));
    } catch (error) {
      console.error("Error fetching user's rebounds:", error);
    }

  const sparkPromises = [];
  const idMapping = [];

  for (let i = 0; i < sparkIds.length; i++) {
    const id = Number(sparkIds[i]);
    sparkPromises.push(
      sparkRegistry.getSpark(id).then(spark => {
        console.log(`Received spark ${id}:`, {
          content: spark.content,
          mediaHash: spark.mediaHash,
          timestamp: Number(spark.timestamp),
          isDeleted: spark.isDeleted
        });

          let timestamp = Number(spark.timestamp);
          if (isNaN(timestamp) || timestamp <= 0) {
            timestamp = Math.floor(Date.now() / 1000); 
          }

          let content = spark.content || "No content available";
          if (typeof content !== 'string') {
            content = String(content || "");
          }
          
        return {
          ...spark,
            content: content,
            timestamp: timestamp,
            likes: Number(spark.likes) || 0,
            rebounds: Number(spark.rebounds) || 0,
            isRebound: false,
            originalSparkId: null,
            type: 'spark'
          };
        }).catch(error => {
          console.error(`Error fetching spark ${id}:`, error);
          return {
            author: userAddress,
            content: "Error loading content",
            mediaHash: "",
            timestamp: Math.floor(Date.now() / 1000),
            likes: 0,
            rebounds: 0,
            isDeleted: false,
          isRebound: false,
            originalSparkId: null,
            type: 'spark'
        };
      })
    );
    idMapping.push(id);
  }

  const reboundPromises = [];
  for (let i = 0; i < reboundIds.length; i++) {
    const reboundId = Number(reboundIds[i]);
    reboundPromises.push(
      Promise.all([
          reboundManager.getRebound(reboundId).catch(error => {
            console.error(`Error fetching rebound ${reboundId}:`, error);
            return {
              rebounder: userAddress,
              originalSparkId: 0,
              comment: "Error loading rebound",
              timestamp: Math.floor(Date.now() / 1000)
            };
          }),
        reboundId
      ]).then(([rebound, id]) => {
        const originalId = Number(rebound.originalSparkId);

          let timestamp = Number(rebound.timestamp);
          if (isNaN(timestamp) || timestamp <= 0) {
            timestamp = Math.floor(Date.now() / 1000); 
          }

          let comment = rebound.comment || "";
          if (typeof comment !== 'string') {
            comment = String(comment || "");
          }

          return sparkRegistry.getSpark(originalId).then(originalSpark => {
            
            let originalContent = originalSpark.content || "No content available";
            if (typeof originalContent !== 'string') {
              originalContent = String(originalContent || "");
            }
            
            return {
          id: id,
          author: rebound.rebounder,
              content: comment || originalContent,
          mediaHash: originalSpark.mediaHash,
              timestamp: timestamp,
              likes: Number(originalSpark.likes) || 0,
              rebounds: Number(originalSpark.rebounds) || 0,
              isDeleted: false,
              isRebound: true,
              originalSparkId: originalId,
              originalAuthor: originalSpark.author,
              type: 'rebound'
            };
          }).catch(error => {
            console.error(`Error fetching original spark ${originalId} for rebound:`, error);
            return {
              id: id,
              author: rebound.rebounder,
              content: comment || "Original content unavailable",
              mediaHash: "",
              timestamp: timestamp,
              likes: 0,
              rebounds: 0,
          isDeleted: false,
          isRebound: true,
          originalSparkId: originalId,
              originalAuthor: "0x0000000000000000000000000000000000000000",
              type: 'rebound'
            };
          });
        }).catch(error => {
          console.error(`Error processing rebound ${reboundId}:`, error);
          return {
            id: reboundId,
            author: userAddress,
            content: "Error loading rebound data",
            mediaHash: "",
            timestamp: Math.floor(Date.now() / 1000),
            likes: 0,
            rebounds: 0,
            isDeleted: false,
            isRebound: true,
            originalSparkId: 0,
            originalAuthor: "0x0000000000000000000000000000000000000000",
            type: 'rebound'
          };
      })
    );
  }

  const [sparks, rebounds] = await Promise.all([
    Promise.all(sparkPromises),
    Promise.all(reboundPromises)
  ]);

  const allContent = [
    ...sparks.map((spark, i) => ({
      ...spark,
      id: idMapping[i] 
    })),
    ...rebounds
  ]
  .filter(item => !item.isDeleted)
  .sort((a, b) => b.timestamp - a.timestamp); 

  const paginatedContent = allContent.slice(skip, skip + limit);
  
  console.log("Combined user content:", paginatedContent);

    if (paginatedContent.length === 0) {
      return [{
        id: "placeholder-1",
        author: userAddress,
        content: "No content yet. Create your first spark to get started!",
        mediaHash: "",
        timestamp: Math.floor(Date.now() / 1000),
        likes: 0,
        rebounds: 0,
        isDeleted: false,
        type: 'spark'
      }];
    }
    
  return paginatedContent;
  } catch (error) {
    console.error("Error in fetchUserSparksAndRebounds:", error);
    
    return [{
      id: "error-1",
      author: userAddress,
      content: "We're having trouble loading your content. Please try again later.",
      mediaHash: "",
      timestamp: Math.floor(Date.now() / 1000),
      likes: 0,
      rebounds: 0,
      isDeleted: false,
      type: 'spark'
    }];
  }
}

export async function fetchSparksAndRebounds(limit = 20, skip = 0) {
  try {
    
    const provider = getProvider();

      const minimalAbi = [
        "function getSparkCount() external view returns (uint256)",
      "function getSpark(uint256 sparkId) external view returns (tuple(address author, string content, string mediaHash, uint256 timestamp, uint256 likes, uint256 rebounds, bool isDeleted))",
      "function getSparksByAuthor(address author) external view returns (uint256[])",
      "function getReboundsByUser(address user) external view returns (uint256[])"
      ];
      
      const sparkRegistry = new ethers.Contract(
        contractAddresses.SparkRegistry, 
        minimalAbi, 
        provider
      );

    const totalSparks = await sparkRegistry.getSparkCount();
    console.log("Total sparks:", totalSparks);
    const totalSparkCount = Number(totalSparks);
    
    if (totalSparkCount === 0) {
      console.log("No sparks found");
      return [];
    }

    const sparkPromises = [];
    const sparkIndices = [];

    const startIndex = Math.max(0, totalSparkCount - skip - limit);
    const endIndex = Math.max(0, totalSparkCount - skip);
    
    for (let i = startIndex; i < endIndex; i++) {
      sparkPromises.push(
        sparkRegistry.getSpark(i).catch(error => {
          console.error(`Error fetching spark ${i}:`, error);
          return {
            author: "0x0000000000000000000000000000000000000000",
            content: "Error loading content",
            mediaHash: "",
            timestamp: Date.now() / 1000,
            likes: 0,
            rebounds: 0,
            isDeleted: false
          };
        })
      );
      sparkIndices.push(i);
    }

    const sparks = await Promise.all(sparkPromises);
    
    console.log("Fetched sparks:", sparks);

    const formattedSparks = sparks.map((spark, index) => {
      if (!spark || spark.isDeleted) return null;
      return {
      id: sparkIndices[index],
        author: spark.author || "0x0000000000000000000000000000000000000000",
      content: spark.content || "No content available",
      mediaHash: spark.mediaHash || "",
        timestamp: Number(spark.timestamp) || Date.now() / 1000,
        likes: Number(spark.likes) || 0,
        rebounds: Number(spark.rebounds) || 0,
        isDeleted: spark.isDeleted || false,
        type: 'spark'  
      };
    }).filter(spark => spark !== null);
    
    console.log("Formatted sparks:", formattedSparks);

    formattedSparks.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

    if (formattedSparks.length === 0) {
      formattedSparks.push({
        id: "placeholder-1",
        author: contractAddresses.SparkRegistry || "0x0000000000000000000000000000000000000000",
        content: "Welcome to Unbound! Create your first spark to get started.",
        timestamp: Date.now() / 1000,
        likes: 0,
        rebounds: 0,
        isDeleted: false,
        type: 'spark'
      });
    }
    
    return formattedSparks.slice(0, limit);
  } catch (error) {
    console.error("Error in fetchSparksAndRebounds:", error);
    
    return [{
      id: "error-1",
      author: "0x0000000000000000000000000000000000000000",
      content: "We're having trouble loading content. Please try again later.",
      timestamp: Date.now() / 1000,
      likes: 0,
      rebounds: 0,
      isDeleted: false,
      type: 'spark'
    }];
  }
}

export async function likeSpark(sparkId) {
  try {
    console.log(`Attempting to like spark #${sparkId}`);

    if (sparkId === undefined || sparkId === null) {
      console.error("Cannot like spark: Invalid sparkId provided");
      return { success: false, message: "Invalid spark ID provided" };
    }
    
    const numericSparkId = Number(sparkId);
    if (isNaN(numericSparkId)) {
      console.error("Cannot like spark: sparkId is not a number", sparkId);
      return { success: false, message: "Spark ID must be a number" };
    }

    const { sparkRegistry, interactionTracker } = getContracts();
    
    try {
      const spark = await sparkRegistry.getSpark(numericSparkId);
      if (!spark || spark.isDeleted) {
        console.error(`Cannot like spark #${numericSparkId}: Spark does not exist or was deleted`);
        return { success: false, message: "This spark doesn't exist or was deleted" };
      }
    } catch (error) {
      console.error(`Error checking if spark #${numericSparkId} exists:`, error);
      return { success: false, message: "Could not verify spark existence" };
    }

    const provider = getProvider();
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    
    try {
      const hasLiked = await interactionTracker.hasLikedSpark(userAddress, numericSparkId);
      if (hasLiked) {
        console.log(`Spark #${numericSparkId} is already liked by ${userAddress}`);
        return { success: false, message: "You've already liked this spark" };
      }
    } catch (error) {
      console.error(`Error checking if user has liked spark #${numericSparkId}:`, error);
      
    }

    const signerContract = interactionTracker.connect(signer);
    
    console.log(`Sending transaction to like spark #${numericSparkId}`);
    const tx = await signerContract.likeSpark(numericSparkId);
    
    console.log(`Transaction sent! Hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`Like transaction confirmed! Block: ${receipt.blockNumber}`);
    
    return { 
      success: true, 
      message: "Successfully liked the spark", 
      txHash: tx.hash 
    };
  } catch (error) {
    console.error("Error liking spark:", error);

    if (error.code === 'ACTION_REJECTED') {
      return { success: false, message: "Transaction was rejected" };
    } else if (error.message?.includes('insufficient funds')) {
      return { success: false, message: "Insufficient funds for transaction" };
    } else if (error.message?.includes('already liked')) {
      return { success: false, message: "You've already liked this spark" };
    }
    
    return { 
      success: false, 
      message: "Failed to like the spark: " + (error.message || "Unknown error")
    };
  }
}

export async function unlikeSpark(sparkId) {
  try {
    console.log(`Attempting to unlike spark #${sparkId}`);

    if (sparkId === undefined || sparkId === null) {
      console.error("Cannot unlike spark: Invalid sparkId provided");
      return { success: false, message: "Invalid spark ID provided" };
    }
    
    const numericSparkId = Number(sparkId);
    if (isNaN(numericSparkId)) {
      console.error("Cannot unlike spark: sparkId is not a number", sparkId);
      return { success: false, message: "Spark ID must be a number" };
    }

    const { sparkRegistry, interactionTracker } = getContracts();
    
    try {
      const spark = await sparkRegistry.getSpark(numericSparkId);
      if (!spark || spark.isDeleted) {
        console.error(`Cannot unlike spark #${numericSparkId}: Spark does not exist or was deleted`);
        return { success: false, message: "This spark doesn't exist or was deleted" };
      }
    } catch (error) {
      console.error(`Error checking if spark #${numericSparkId} exists:`, error);
      return { success: false, message: "Could not verify spark existence" };
    }

    const provider = getProvider();
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    
    try {
      const hasLiked = await interactionTracker.hasLikedSpark(userAddress, numericSparkId);
      if (!hasLiked) {
        console.log(`Spark #${numericSparkId} was not previously liked by ${userAddress}`);
        return { success: false, message: "You haven't liked this spark yet" };
      }
    } catch (error) {
      console.error(`Error checking if user has liked spark #${numericSparkId}:`, error);
      
    }

    const signerContract = interactionTracker.connect(signer);
    
    console.log(`Sending transaction to unlike spark #${numericSparkId}`);
    const tx = await signerContract.unlikeSpark(numericSparkId);
    
    console.log(`Transaction sent! Hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`Unlike transaction confirmed! Block: ${receipt.blockNumber}`);
    
    return { 
      success: true, 
      message: "Successfully unliked the spark", 
      txHash: tx.hash 
    };
  } catch (error) {
    console.error("Error unliking spark:", error);

    if (error.code === 'ACTION_REJECTED') {
      return { success: false, message: "Transaction was rejected" };
    } else if (error.message?.includes('insufficient funds')) {
      return { success: false, message: "Insufficient funds for transaction" };
    } else if (error.message?.includes('not liked')) {
      return { success: false, message: "You haven't liked this spark yet" };
    }
    
    return { 
      success: false, 
      message: "Failed to unlike the spark: " + (error.message || "Unknown error")
    };
  }
} 