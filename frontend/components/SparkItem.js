import React, { useState, useEffect } from 'react';
import { setupNetwork } from "../utils/ethereum";
import { isIpfsHash, fetchIpfsContent, getIpfsImageUrl } from '../utils/ipfs';
import { createRebound } from '../utils/rebound';
import { formatAddress as formatAddressUtil, formatDate } from '../utils/format';
import { ethers } from 'ethers';
import { getProfileData } from '../utils/profile';
import { likeSpark, unlikeSpark } from '../utils/sparks';
import Link from 'next/link';
import ReboundItem from './ReboundItem';

// Helper to get the ReboundManager contract instance
import addresses from "../contract-addresses.json";
import SparkRegistryABI from "../abis/SparkRegistry.json";
import ReboundManagerABI from "../abis/ReboundManager.json";

export default function SparkItem({ 
  sparkId, 
  author, 
  content = "Loading content...", 
  mediaHash = null,
  timestamp = new Date(),
  likeCount: initialLikeCount = 0, 
  responseCount: initialResponseCount = 0,
  hasLiked: initialHasLiked = false,
  showRebounds = false, 
  onAction,
  currentUser
}) {
  const [authorData, setAuthorData] = useState(null);
  const [displayContent, setDisplayContent] = useState('Loading content...');
  const [mediaUrl, setMediaUrl] = useState(null);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [reboundCount, setReboundCount] = useState(initialResponseCount);
  const [isRebounding, setIsRebounding] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [contentError, setContentError] = useState(null);
  const [reboundModalOpen, setReboundModalOpen] = useState(false);
  const [reboundComment, setReboundComment] = useState("");
  const [reboundError, setReboundError] = useState("");
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  
  useEffect(() => {
    // Get author info
    const fetchAuthor = async () => {
      try {
        // If the author is an object with full data, use it directly
        if (author && typeof author === 'object' && author.username) {
          setAuthorData(author);
          return;
        }
        
        // Otherwise fetch profile data for the address
        const authorAddress = (typeof author === 'object') ? 
          author.address : author;
          
        const fetchedAuthorData = await getProfileData(authorAddress);
        setAuthorData(fetchedAuthorData);
      } catch (error) {
        console.error('Error fetching author:', error);
        
        // Create a minimal author object with formatted address
        const authorAddress = (typeof author === 'object') ? 
          author.address : author;
          
        setAuthorData({
          displayName: authorAddress.substring(0, 6) + '...' + authorAddress.substring(authorAddress.length - 4),
          address: authorAddress,
        });
      }
    };
    
    fetchAuthor();
    
    // Process content
    const processContent = async () => {
      // First set default content to what we have
      let processedContent = content || 'No content available';
      setContentError(null);
      
      try {
        // If the content looks like an IPFS hash, fetch the real content
        if (content && isIpfsHash(content)) {
          console.log("Fetching IPFS content for hash:", content);
          const fetchedContent = await fetchIpfsContent(content);
          
          // Handle different content types
          if (fetchedContent) {
            if (typeof fetchedContent === 'string') {
              processedContent = fetchedContent;
            } else if (typeof fetchedContent === 'object') {
              // Handle JSON objects
              processedContent = fetchedContent.text || JSON.stringify(fetchedContent);
            }
          }
        }
      } catch (error) {
        console.error("Error processing content:", error);
        processedContent = "Error loading content";
        setContentError('An unexpected error occurred');
      } finally {
        // Always set the content, even if there was an error
        setDisplayContent(processedContent);
      }
    };
    
    processContent();
    
    // If we have media, get the IPFS URL with fallback
    const fetchMedia = async () => {
      if (mediaHash && mediaHash !== "") {
        setIsMediaLoading(true);
        try {
          const ipfsUrl = await getIpfsImageUrl(mediaHash);
          
          // Try to determine if it's an image or video (simplified approach)
          const isImage = !(/\.(mp4|mov|avi|wmv)$/i.test(mediaHash));
          setMediaUrl(ipfsUrl);
        } catch (error) {
          console.error("Error loading media:", error);
        } finally {
          setIsMediaLoading(false);
        }
      }
    };
    
    fetchMedia();
    
    // Check if the user has liked this spark
    const checkIfLiked = async () => {
      if (!window.ethereum || !currentUser || !sparkId) return;
      
      try {
        // Simple contract instance with just the hasLiked function
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Try to get the signer
        let signer;
        try {
          signer = await provider.getSigner();
        } catch (error) {
          console.error("Error getting signer:", error);
          return; // Exit early if we can't get a signer
        }
        
        // ABI for just the hasLiked function
        const minimalAbi = [
          "function hasLiked(uint256 sparkId, address user) external view returns (bool)"
        ];
        
        const contract = new ethers.Contract(
          addresses.sparkRegistry, 
          minimalAbi, 
          signer
        );
        
        try {
          const liked = await contract.hasLiked(sparkId, currentUser);
          setHasLiked(liked);
        } catch (contractError) {
          console.error("Contract error checking like status:", contractError);
        }
      } catch (err) {
        console.error("Error checking like status:", err);
      }
    };
    
    if (window.ethereum && currentUser) {
      checkIfLiked();
    }
  }, [author, content, mediaHash, sparkId, currentUser]);

  // Format wallet address to shortened form
  const formatAddress = (address) => {
    return formatAddressUtil(address);
  };

  const handleLike = async () => {
    if (isLiking || !window.ethereum || !currentUser) {
      alert("Please connect your wallet to like sparks");
      return;
    }
    
    setIsLiking(true);
    try {
      await setupNetwork();
      
      if (hasLiked) {
        await unlikeSpark(sparkId);
        setHasLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await likeSpark(sparkId);
        setHasLiked(true);
        setLikeCount(prev => prev + 1);
      }
      
      if (onAction) onAction();
    } catch (err) {
      console.error("Error liking/unliking spark:", err);
      alert(`Error: ${err.message || 'Failed to process like'}`);
    } finally {
      setIsLiking(false);
    }
  };
  
  const handleRebound = async () => {
    if (isRebounding || !window.ethereum || !currentUser) {
      alert("Please connect your wallet to rebound sparks");
      return;
    }
    
    setIsRebounding(true);
    setReboundError("");
    try {
      await setupNetwork();
      
      // Debug info about the spark ID
      console.log("Attempting to rebound spark with ID:", sparkId);
      
      // More robust spark ID handling
      let parsedSparkId;
      if (sparkId === undefined || sparkId === null) {
        throw new Error("Invalid spark: ID is missing");
      }
      
      // Try different methods to get a valid number
      if (typeof sparkId === 'number') {
        parsedSparkId = sparkId;
      } else if (typeof sparkId === 'string') {
        // Remove any non-numeric characters if it's a string
        const cleaned = sparkId.replace(/[^0-9]/g, '');
        if (cleaned === '') {
          throw new Error("Invalid spark ID: not a number");
        }
        parsedSparkId = parseInt(cleaned, 10);
      } else if (typeof sparkId === 'bigint') {
        parsedSparkId = Number(sparkId);
      } else {
        throw new Error(`Unsupported spark ID type: ${typeof sparkId}`);
      }
      
      // Final validation
      if (isNaN(parsedSparkId) || parsedSparkId < 0) {
        throw new Error(`Invalid spark ID: ${parsedSparkId}`);
      }
      
      console.log("Final spark ID to use:", parsedSparkId, typeof parsedSparkId);
      
      // Create the rebound
      const result = await createRebound(parsedSparkId, reboundComment);
      
      if (result.success) {
        setReboundCount(prev => prev + 1);
        setReboundModalOpen(false);
        setReboundComment("");
        if (onAction) onAction();
      } else {
        throw new Error(result.error || "Failed to create rebound");
      }
    } catch (err) {
      console.error("Rebound error:", err);
      setReboundError(err?.message || "Failed to rebound");
    } finally {
      setIsRebounding(false);
    }
  };
  
  const handleComment = async () => {
    if (commentLoading || !comment.trim() || !window.ethereum || !currentUser) {
      alert("Please connect your wallet and enter a comment");
      return;
    }
    
    setCommentLoading(true);
    setCommentError("");
    try {
      await setupNetwork();
      
      // In a real implementation, we would save the comment via a smart contract
      alert("Comments are not yet implemented in the smart contract");
      
      // Reset and close
      setComment("");
      setCommentModalOpen(false);
      if (onAction) onAction();
    } catch (err) {
      setCommentError(err?.message || "Failed to post comment");
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <div className="bg-[#2A2A2A] p-4 rounded-lg border border-gray-700">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Link href={`/profile?address=${authorData?.address || author}`} className="block">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden cursor-pointer">
              {authorData?.avatarUrl ? (
                <img 
                  src={authorData.avatarUrl} 
                  alt={authorData.username || "Author"} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-sm">
                  {authorData?.username?.charAt(0) || 
                   authorData?.displayName?.charAt(0) || 
                   (typeof author === 'string' ? author.slice(0, 2) : "?")}
                </span>
              )}
            </div>
          </Link>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <Link href={`/profile?address=${authorData?.address || author}`} className="hover:underline cursor-pointer">
              <span className="text-white font-semibold">
                {authorData?.username || 
                 authorData?.displayName || 
                 formatAddress(typeof author === 'string' ? author : author?.address || '')}
              </span>
            </Link>
            <span className="ml-2 text-gray-400 text-sm">
              {formatDate(timestamp)}
            </span>
          </div>
          
          <p className="text-gray-300 mt-1 break-words whitespace-pre-wrap">
            {displayContent}
          </p>
          
          {isMediaLoading && (
            <div className="mt-3 flex justify-center">
              <div className="animate-pulse rounded-md bg-gray-700 h-40 w-full"></div>
            </div>
          )}
          
          {mediaUrl && !isMediaLoading && (
            <div className="mt-3">
              <img 
                src={mediaUrl} 
                alt="Media content" 
                className="rounded-md max-h-96 max-w-full"
                onError={(e) => {
                  console.log("Media loading error");
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="flex items-center space-x-4 mt-3 text-gray-400">
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-1 ${hasLiked ? 'text-red-500' : 'hover:text-gray-300'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={hasLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likeCount}</span>
            </button>
            
            <button 
              onClick={() => setReboundModalOpen(true)}
              className="flex items-center space-x-1 hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span>{reboundCount}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Rebound Modal */}
      {reboundModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E1E1E] rounded-lg max-w-lg w-full p-6 relative">
            <button 
              onClick={() => setReboundModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-white text-xl font-bold mb-4">Rebound this Spark</h3>
            
            <div className="bg-[#2A2A2A] p-3 rounded-md mb-4">
              <p className="text-gray-300 text-sm">{displayContent}</p>
            </div>
            
            <textarea
              value={reboundComment}
              onChange={(e) => setReboundComment(e.target.value)}
              placeholder="Add a comment (optional)"
              className="w-full bg-[#2A2A2A] text-white p-3 rounded-md resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#9B7CFA]"
            />
            
            {reboundError && (
              <p className="text-red-500 text-sm mt-2">{reboundError}</p>
            )}
            
            <div className="flex justify-end mt-4">
              <button
                onClick={handleRebound}
                disabled={isRebounding}
                className="bg-[#9B7CFA] hover:bg-[#8b6be0] text-white px-4 py-2 rounded-full flex items-center space-x-2"
              >
                {isRebounding && (
                  <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                )}
                <span>Rebound</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
