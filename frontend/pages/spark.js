import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { getWritableContract, setupNetwork } from "../utils/ethereum";
import { pinJSONToIPFS } from "../utils/pinata";
import Layout from "../components/layout";

const Spark = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sparkText, setSparkText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSpark = async () => {
    if (!sparkText.trim() || loading) return;
    
    setLoading(true);
    setStatus("");
    try {
      
      const networkSetup = await setupNetwork().catch(() => false);
      if (!networkSetup) {
        setStatus("Please connect to the correct network in MetaMask");
        setLoading(false);
        return;
      }

      setStatus("Uploading to IPFS...");
      const contentIpfsHash = await pinJSONToIPFS({ content: sparkText });

      setStatus("Saving to blockchain...");
      const contract = await getWritableContract();
      const tx = await contract.createSpark(contentIpfsHash, ""); 
      await tx.wait();
      
      setStatus("Spark posted successfully!");
      setSparkText("");
      setTimeout(() => {
        setIsOpen(false);
        setStatus("");
      }, 1500);
    } catch (err) {
      console.error("Error posting spark:", err);
      setStatus("Error: " + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-6">Create a Spark</h1>
        
        {}
        <div className="bg-[#2A2A2A] p-6 rounded-lg">
          <textarea
            rows="4"
            className="w-full bg-transparent border border-gray-600 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#9B7CFA]"
            placeholder="What's on your mind?"
            value={sparkText}
            onChange={(e) => setSparkText(e.target.value)}
          />

          <div className="mt-4 flex justify-between items-center">
            {status && (
              <p className={`text-sm ${status.includes("Error") ? "text-red-400" : "text-green-400"}`}>
                {status}
              </p>
            )}
            <button
              onClick={handleSpark}
              className="bg-[#9B7CFA] text-white px-6 py-2 rounded-full hover:bg-[#8b6be0] transition disabled:opacity-50"
              disabled={!sparkText.trim() || loading}
            >
              {loading ? "Posting..." : "Post Spark"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Spark;
