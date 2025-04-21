
import { ethers } from 'ethers';
import { getReadOnlyContract } from './ethereum';

export const getSparkRegistryWritable = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not available');
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  const contract = getReadOnlyContract();
  return contract.connect(signer);
};

export const likeSpark = async (sparkId) => {
  const contract = await getSparkRegistryWritable();
  const tx = await contract.likeSpark(sparkId);
  return await tx.wait();
};

export const unlikeSpark = async (sparkId) => {
  const contract = await getSparkRegistryWritable();
  const tx = await contract.unlikeSpark(sparkId);
  return await tx.wait();
};

export const hasLiked = async (sparkId, address) => {
  if (!address) return false;
  const contract = getReadOnlyContract();
  return await contract.hasLiked(sparkId, address);
};
