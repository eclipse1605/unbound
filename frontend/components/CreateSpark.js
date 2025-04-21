"use client";
import { useState } from "react";
import { setupNetwork } from "../utils/ethereum";
import { pinJSONToIPFS, pinFileToIPFS } from "../utils/pinata";
import { ethers } from "ethers";
import addresses from "../contract-addresses.json";

export default function CreateSpark({ onClose, onSuccess }) {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function getSparkRegistryContract() {
    if (!window.ethereum) {
      throw new Error("MetaMask not detected. Please install MetaMask to create sparks.");
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    
    console.log("Using spark registry address:", addresses.sparkRegistry);

    const sparkRegistryAbi = [
      "function createSpark(string memory content, string memory mediaHash) external returns (uint256)"
    ];
    
    return new ethers.Contract(addresses.sparkRegistry, sparkRegistryAbi, signer);
  }

  async function handleCreateSpark(e) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      
      const networkSetup = await setupNetwork().catch(() => false);
      if (!networkSetup) {
        setStatus("Please connect to the correct network in MetaMask");
        setLoading(false);
        return;
      }

      let ipfsHash = "";
      if (mediaFile) {
        setStatus("Uploading media to IPFS...");
        ipfsHash = await pinFileToIPFS(mediaFile);
      }

      setStatus("Uploading spark to IPFS...");
      
      const contentIpfsHash = await pinJSONToIPFS({ content });
      setStatus("Uploading spark to blockchain...");

      const contract = await getSparkRegistryContract();
      console.log("Creating spark with content hash:", contentIpfsHash, "media hash:", ipfsHash);

      const tx = await contract.createSpark(contentIpfsHash, ipfsHash);
      console.log("Transaction sent:", tx.hash);
      
      await tx.wait();
      console.log("Transaction confirmed");
      
      setStatus("Spark created successfully!");
      setContent("");
      setMediaFile(null);
      setMediaPreview(null);
      if (onSuccess) onSuccess();
      if (onClose) setTimeout(onClose, 1500); 
    } catch (err) {
      console.error("Error creating spark:", err);
      setStatus("Error creating spark: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleCreateSpark} className="w-full">
      <textarea
        rows="4"
        className="w-full bg-transparent border border-gray-600 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#9B7CFA]"
        placeholder="What's happening?"
        value={content}
        onChange={e => setContent(e.target.value)}
        required
        maxLength={280}
      />
      <div className="mt-4 flex items-center justify-between">
        <div className="flex space-x-4">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={e => {
                const file = e.target.files[0];
                setMediaFile(file);
                if (file) {
                  const url = URL.createObjectURL(file);
                  setMediaPreview(url);
                } else {
                  setMediaPreview(null);
                }
              }}
              className="hidden"
            />
            <img src="/images/image.svg" alt="Add image" className="w-5 h-5 cursor-pointer hover:opacity-80" />
          </label>
          <img src="/images/gif.svg" alt="Add GIF" className="w-5 h-5 cursor-pointer hover:opacity-80" />
          <img src="/images/emoji.svg" alt="Emoji" className="w-5 h-5 cursor-pointer hover:opacity-80" />
          <img src="/images/poll.svg" alt="Poll" className="w-5 h-5 cursor-pointer hover:opacity-80" />
          <img src="/images/schedule.svg" alt="Schedule" className="w-5 h-5 cursor-pointer hover:opacity-80" />
          <img src="/images/location.svg" alt="Location" className="w-5 h-5 cursor-pointer hover:opacity-80" />
        </div>
        <button
          type="submit"
          className="bg-[#9B7CFA] text-white px-4 py-2 rounded-full hover:bg-[#8b6be0] transition disabled:opacity-50"
          disabled={loading || !content.trim()}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
      {mediaPreview && (
        <div className="mt-4">
          {mediaFile && mediaFile.type.startsWith("image") ? (
            <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-lg border border-gray-700" />
          ) : mediaFile && mediaFile.type.startsWith("video") ? (
            <video src={mediaPreview} controls className="max-h-48 rounded-lg border border-gray-700" />
          ) : null}
        </div>
      )}
      {status && (
        <div className={`mt-2 text-sm ${status.includes("Error") ? "text-red-400" : "text-green-400"}`}>
          {status}
        </div>
      )}
    </form>
  );
}
