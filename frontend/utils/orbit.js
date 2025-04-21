import { ethers } from 'ethers';
import { ORBIT_MANAGER_ADDRESS } from '../contract-address';
import OrbitManagerABI from '../abis/OrbitManager.json';

export function getOrbitManagerReadOnly() {
  if (typeof window === 'undefined') throw new Error('No window');
  const provider = new ethers.BrowserProvider(window.ethereum);
  return new ethers.Contract(ORBIT_MANAGER_ADDRESS, OrbitManagerABI.abi, provider);
}

export async function getOrbitManagerWritable() {
  if (typeof window === 'undefined' || !window.ethereum) throw new Error('No MetaMask');
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  return new ethers.Contract(ORBIT_MANAGER_ADDRESS, OrbitManagerABI.abi, signer);
}
