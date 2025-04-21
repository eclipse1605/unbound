import React, { useState } from 'react';
import { ethers } from 'ethers';
import { setupNetwork } from '../utils/ethereum';
import addresses from '../contract-addresses.json';

export default function CreateSparkForm() {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess(false);
    
    try {
      
      await setupNetwork();

      if (!window.ethereum) {
        throw new Error('MetaMask not detected. Please install MetaMask to create sparks.');
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      console.log('Available contract addresses:', addresses);
      console.log('Using spark registry address:', addresses.sparkRegistry);

      const sparkRegistryAbi = [
        "function createSpark(string memory content, string memory contentType) external returns (uint256)"
      ];
      const sparkRegistry = new ethers.Contract(addresses.sparkRegistry, sparkRegistryAbi, signer);

      console.log('Creating spark with content:', content);
      const tx = await sparkRegistry.createSpark(content, 'text');
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      setSuccess(true);
      setContent('');
    } catch (err) {
      console.error('Error creating spark:', err);
      setError(err.message || 'An error occurred while creating the spark');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create a Spark</h2>
      
      {success && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          Spark created successfully!
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
          ></textarea>
        </div>
        
        <div className="flex items-center">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Spark'}
          </button>
          
          {isSubmitting && (
            <span className="ml-3 text-sm text-gray-500">
              Please confirm in MetaMask
            </span>
          )}
        </div>
      </form>
    </div>
  );
} 