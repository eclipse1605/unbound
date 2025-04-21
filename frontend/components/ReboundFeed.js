import { useState, useEffect } from "react";
import ReboundItem from "./ReboundItem";
import { setupNetwork } from "../utils/ethereum";
import { getRecentRebounds, getUserRebounds, getReboundsForParent } from "../utils/rebound";
import { ethers } from "ethers";

export default function ReboundFeed({ 
  type = "recent", 
  userAddress = null, 
  parentType = null, 
  parentId = null, 
  limit = 10 
}) {
  const [rebounds, setRebounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [currentUserAddress, setCurrentUserAddress] = useState(null);

  const getUserAccount = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        setCurrentUserAddress(accounts[0]);
        setHasMetaMask(true);
        return accounts[0];
      } catch (error) {
        console.error("Error getting user account:", error);
        setHasMetaMask(false);
        return null;
      }
    } else {
      setHasMetaMask(false);
      return null;
    }
  };

  const fetchRebounds = async () => {
    try {
      let fetchedRebounds = [];
      
      switch (type) {
        case "user":
          
          fetchedRebounds = await getUserRebounds(userAddress, limit);
          break;
        case "parent":
          
          if (!parentType || !parentId) {
            throw new Error("Parent type and ID required for parent rebound feed");
          }
          fetchedRebounds = await getReboundsForParent(parentType, parentId, limit);
          break;
        case "recent":
        default:
          
          fetchedRebounds = await getRecentRebounds(limit);
          break;
      }
      
      return fetchedRebounds;
    } catch (error) {
      console.error("Error fetching rebounds:", error);
      throw error;
    }
  };

  const refreshFeed = async () => {
    setLoading(true);
    setError("");
    
    try {
      
      const account = await getUserAccount();

      if (window.ethereum) {
        await setupNetwork().catch(() => console.warn("Failed to setup network"));
      }

      const fetchedRebounds = await fetchRebounds();
      
      if (fetchedRebounds && fetchedRebounds.length > 0) {
        console.log("Setting rebounds:", fetchedRebounds);
        setRebounds(fetchedRebounds);
      } else {
        
        setRebounds([]);
      }
    } catch (err) {
      console.error("Error refreshing rebound feed:", err);
      setError(err.message || String(err));
      setRebounds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFeed();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', refreshFeed);
      window.ethereum.on('chainChanged', refreshFeed);

      return () => {
        window.ethereum.removeListener('accountsChanged', refreshFeed);
        window.ethereum.removeListener('chainChanged', refreshFeed);
      };
    }
  }, [type, userAddress, parentType, parentId, limit]);

  const handleReboundAction = () => {
    
    refreshFeed();
  };

  if (loading) {
    return (
      <div className="p-4 w-full">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#9B7CFA]"></div>
          <p className="mt-4 text-gray-400">Loading rebounds...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 w-full">
        <div className="bg-[#2A2A2A] border border-red-800 text-gray-300 rounded-lg p-4">
          <p className="font-medium">Error Loading Rebounds</p>
          <p className="text-sm my-2">{error}</p>
          <button 
            onClick={refreshFeed}
            className="mt-3 px-4 py-2 bg-[#9B7CFA] text-white rounded-md hover:bg-[#8b6be0]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (rebounds.length === 0) {
    return (
      <div className="p-4 w-full">
        <div className="bg-[#2A2A2A] border border-gray-700 text-gray-300 rounded-lg p-6 text-center">
          <p className="text-lg mb-4">No rebounds found</p>
          <button 
            onClick={refreshFeed}
            className="px-4 py-2 bg-[#9B7CFA] text-white rounded-md hover:bg-[#8b6be0]"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">
          {type === "user" ? "User Rebounds" : 
           type === "parent" ? "Related Rebounds" : 
           "Recent Rebounds"}
        </h2>
        <button 
          onClick={refreshFeed}
          className="text-[#9B7CFA] hover:text-[#8b6be0] text-sm"
        >
          Refresh
        </button>
      </div>
      
      <div className="space-y-4">
        {rebounds.map((rebound) => {
          console.log('Rendering rebound with data:', rebound);
          return (
            <ReboundItem 
              key={rebound.id}
              id={rebound.id}
              rebounder={rebound.author}
              content={rebound.contentURI}
              mediaHash={rebound.mediaHash}
              originalSparkId={rebound.parentId}
              timestamp={rebound.timestamp}
              likeCount={rebound.likeCount}
              hasLiked={rebound.hasLiked}
              onAction={handleReboundAction}
              currentUser={currentUserAddress}
            />
          );
        })}
      </div>
    </div>
  );
} 