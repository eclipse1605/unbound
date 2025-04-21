import React, { useState, useEffect } from 'react';
import { formatAddress, formatDate } from '../utils/format';
import { getProfileData } from '../utils/profile';
import { likeRebound, unlikeRebound, hasLikedRebound, deleteRebound } from '../utils/rebound';
import { setupNetwork } from '../utils/ethereum';
import { isIpfsHash, fetchIpfsContent, getIpfsImageUrl } from '../utils/ipfs';
import Link from 'next/link';

export default function ReboundItem({ 
  id,
  rebounder,
  content = "",
  mediaHash = null,
  originalSparkId,
  timestamp = new Date(),
  likeCount: initialLikeCount = 0,
  hasLiked: initialHasLiked = false,
  onAction,
  currentUser
}) {
  // Debug logging
  console.log(`[ReboundItem ${id}] props:`, { 
    id, 
    rebounder: typeof rebounder === 'object' ? rebounder.address : rebounder, 
    contentExcerpt: content?.substring(0, 20),
    mediaHash
  });
  const [author, setAuthor] = useState(null);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  
  useEffect(() => {
    
    const fetchAuthor = async () => {
      try {
        
        if (rebounder && (typeof rebounder === 'object') && rebounder.username) {
          setAuthor(rebounder);
          return;
        }

        const authorAddress = (typeof rebounder === 'object') ? 
          rebounder.address : rebounder;
          
        const authorData = await getProfileData(authorAddress);
        setAuthor(authorData);
      } catch (error) {
        console.error('Error fetching author:', error);

        const authorAddress = (typeof rebounder === 'object') ? 
          rebounder.address : rebounder;
          
        setAuthor({
          displayName: authorAddress.substring(0, 6) + '...' + authorAddress.substring(authorAddress.length - 4),
          address: authorAddress,
        });
      }
    };
    
    fetchAuthor();

    // If media hash is provided, fetch the media
    const fetchMedia = async () => {
      if (!mediaHash) return;
      
      try {
        console.log(`Fetching media for rebound ${id} with hash:`, mediaHash);
        setIsMediaLoading(true);
        
        if (isIpfsHash(mediaHash)) {
          const imageUrl = getIpfsImageUrl(mediaHash);
          console.log('IPFS image URL:', imageUrl);
          setMediaUrl(imageUrl);
        } else if (mediaHash.startsWith('http')) {
          setMediaUrl(mediaHash);
        }
      } catch (error) {
        console.error('Error fetching media for rebound:', error);
      } finally {
        setIsMediaLoading(false);
      }
    };
    
    fetchMedia();

    const checkIfLiked = async () => {
      if (!window.ethereum || !currentUser || !id) return;
      
      try {
        const liked = await hasLikedRebound(id, currentUser);
        setHasLiked(liked);
      } catch (err) {
        console.error("Error checking like status for rebound:", err);
      }
    };
    
    if (window.ethereum && currentUser) {
      checkIfLiked();
    }
  }, [rebounder, id, currentUser, mediaHash]);

  const handleLike = async () => {
    if (isLiking || !window.ethereum || !currentUser) {
      alert("Please connect your wallet to like rebounds");
      return;
    }
    
    setIsLiking(true);
    setError(null);
    try {
      await setupNetwork();
      
      if (hasLiked) {
        const result = await unlikeRebound(id);
        if (result.success) {
          setHasLiked(false);
          setLikeCount(prev => Math.max(0, prev - 1));
        } else {
          throw new Error(result.error || "Failed to unlike rebound");
        }
      } else {
        const result = await likeRebound(id);
        if (result.success) {
          setHasLiked(true);
          setLikeCount(prev => prev + 1);
        } else {
          throw new Error(result.error || "Failed to like rebound");
        }
      }
      
      if (onAction) onAction();
    } catch (err) {
      console.error("Error liking/unliking rebound:", err);
      setError(`Error: ${err.message || 'Failed to process like'}`);
    } finally {
      setIsLiking(false);
    }
  };
  
  const handleDelete = async () => {
    if (isDeleting || !window.ethereum || !currentUser) {
      alert("Please connect your wallet to delete rebounds");
      return;
    }
    
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    setIsDeleting(true);
    setError(null);
    try {
      await setupNetwork();
      
      const result = await deleteRebound(id);
      if (result.success) {
        if (onAction) onAction();
      } else {
        throw new Error(result.error || "Failed to delete rebound");
      }
    } catch (err) {
      console.error("Error deleting rebound:", err);
      setError(`Error: ${err.message || 'Failed to delete rebound'}`);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const isAuthor = currentUser && author && currentUser.toLowerCase() === author.address?.toLowerCase();

  return (
    <div className="bg-[#2A2A2A] p-4 rounded-lg border border-gray-700">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Link href={`/profile?address=${author?.address || rebounder}`} className="block">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden cursor-pointer">
              {author?.avatarUrl ? (
                <img 
                  src={author.avatarUrl} 
                  alt={author.username || "Author"} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-sm">
                  {author?.username?.charAt(0) || 
                   author?.displayName?.charAt(0) || 
                   (typeof rebounder === 'string' ? rebounder.slice(0, 2) : "?")}
                </span>
              )}
            </div>
          </Link>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <Link href={`/profile?address=${author?.address || rebounder}`} className="hover:underline cursor-pointer">
              <span className="text-white font-semibold">
                {author?.username || 
                 author?.displayName || 
                 formatAddress(typeof rebounder === 'string' ? rebounder : rebounder?.address || '')}
              </span>
            </Link>
            <span className="ml-2 text-gray-400 text-sm">
              {formatDate(timestamp)}
            </span>
            <span className="ml-2 text-gray-500 text-xs">
              • Rebounded
            </span>
          </div>
          
          <p className="text-gray-300 mt-1 break-words whitespace-pre-wrap">
            {content}
          </p>
          
          {/* Display media content if available */}
          {mediaUrl && (
            <div className="mt-3 rounded-lg overflow-hidden bg-gray-800 relative">
              <img
                src={mediaUrl}
                alt="Rebound media content"
                className="w-full h-auto max-h-80 object-contain"
                onError={(e) => {
                  console.error('Failed to load image:', mediaUrl);
                  e.target.style.display = 'none';
                }}
              />
              {isMediaLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          )}
          
          {originalSparkId && (
            <Link href={`/spark?id=${originalSparkId}`} className="text-xs text-[#9B7CFA] hover:underline mt-2 inline-block">
              View original spark
            </Link>
          )}
          
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
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
            
            {isAuthor && (
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className={`flex items-center space-x-1 ${confirmDelete ? 'text-red-500' : 'hover:text-red-400'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>{isDeleting ? "Deleting..." : confirmDelete ? "Confirm Delete" : "Delete"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 