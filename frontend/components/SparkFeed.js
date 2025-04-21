import { useState, useEffect } from "react";
import SparkItem from "./SparkItem";
import ReboundItem from "./ReboundItem";
import { setupNetwork } from "../utils/ethereum";
import { fetchSparksAndRebounds } from "../utils/directQueries";
import { ethers } from "ethers";
import addresses from "../contract-addresses.json";

export default function SparkFeed() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [userAddress, setUserAddress] = useState(null);

  const getUserAccount = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        setUserAddress(accounts[0]);
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

  const refreshFeed = async () => {
    setLoading(true);
    setError("");
    
    try {
      
      const account = await getUserAccount();

      if (window.ethereum) {
        await setupNetwork().catch(() => console.warn("Failed to setup network"));
      }

      const fetchedContent = await fetchSparksAndRebounds(10, 0);
      
      console.log("Setting content:", fetchedContent);
      setContent(fetchedContent);
    } catch (err) {
      console.error("Error refreshing feed:", err);
      setError(err.message || String(err));

      const errorContent = [{
        id: "error-1",
        author: "0x0000000000000000000000000000000000000000",
        content: "We couldn't load the latest content. Please check your connection and try again.",
        timestamp: Date.now() / 1000,
        likes: 0,
        rebounds: 0,
        isDeleted: false,
        type: 'spark'
      }];
      setContent(errorContent);
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
  }, []);

  const handleSparkAction = () => {
    
    refreshFeed();
  };

  if (loading) {
    return (
      <div className="p-4 w-full">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#9B7CFA]"></div>
          <p className="mt-4 text-gray-400">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error && content.length === 0) {
    return (
      <div className="p-4 w-full">
        <div className="bg-[#2A2A2A] border border-red-800 text-gray-300 rounded-lg p-4">
          <p className="font-medium">Error Loading Feed</p>
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

  if (content.length === 0) {
    return (
      <div className="p-4 w-full">
        <div className="bg-[#2A2A2A] border border-gray-700 text-gray-300 rounded-lg p-6 text-center">
          <p className="text-lg mb-4">No content yet! Be the first one to create a spark.</p>
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
        <h2 className="text-xl font-semibold text-white">Latest Activity</h2>
        <button 
          onClick={refreshFeed}
          className="text-[#9B7CFA] hover:text-[#8b6be0] text-sm"
        >
          Refresh
        </button>
      </div>
      
      {!hasMetaMask && (
        <div className="mb-4 p-3 bg-[#2A2A2A] border border-[#9B7CFA] rounded-lg text-gray-300">
          <p className="text-sm">
            💡 <strong>Tip:</strong> Connect MetaMask to interact with sparks and create your own content.
          </p>
        </div>
      )}
      
      <div className="space-y-4">
        {content.map((item) => {
          console.log("[SparkFeed] Rendering item:", { 
            id: item.id, 
            hasMediaHash: !!item.mediaHash,
            mediaHash: item.mediaHash 
          });
          
          return item.type === 'rebound' ? (
            <ReboundItem
              key={item.id}
              id={item.id}
              rebounder={item.author}
              content={item.content}
              originalSparkId={item.originalSparkId}
              timestamp={new Date(item.timestamp * 1000)}
              onAction={handleSparkAction}
              currentUser={userAddress}
            />
          ) : (
            <SparkItem
              key={item.id}
              sparkId={item.id}
              author={item.author}
              content={item.content}
              mediaHash={item.mediaHash} /* This prop was missing - the key fix */
              timestamp={new Date(item.timestamp * 1000)}
              likeCount={item.likes}
              responseCount={item.rebounds}
              onAction={handleSparkAction}
              currentUser={userAddress}
            />
          );
        })}
      </div>
    </div>
  );
}
