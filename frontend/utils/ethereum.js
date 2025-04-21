import { ethers } from 'ethers';
import addresses from '../contract-addresses.json';
import SparkRegistryABIJson from '../abis/SparkRegistry.json';
import ReboundManagerABIJson from '../abis/ReboundManager.json';

const SparkRegistryABI = SparkRegistryABIJson.abi;
const ReboundManagerABI = ReboundManagerABIJson.abi;

function validateABI(abi, name) {
  if (!Array.isArray(abi)) {
    console.error(`Invalid ${name} ABI:`, abi);
    throw new Error(`${name} ABI is not a valid array. Check the JSON file format.`);
  }
  return abi;
}

export function getProvider() {
  
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }

  return new ethers.JsonRpcProvider('http://127.0.0.1:8545');
}

export async function getProviderOrSigner(needSigner = false) {
  if (!needSigner) {
    return getProvider();
  }
  
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not detected. Please install MetaMask to perform this action.');
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  return provider.getSigner();
}

export function getReadOnlyContract(address, abi) {
  try {
    validateABI(abi, 'Contract');
    const provider = getProvider();
    return new ethers.Contract(address, abi, provider);
  } catch (error) {
    console.error('Error creating read-only contract:', error);
    throw error;
  }
}

export function getSparkRegistryReadOnly() {
  return getReadOnlyContract(addresses.sparkRegistry, validateABI(SparkRegistryABI, 'SparkRegistry'));
}

export function getReboundManagerReadOnly() {
  const provider = getProvider();
  return new ethers.Contract(
    addresses.reboundManager,
    validateABI(ReboundManagerABI, 'ReboundManager'),
    provider
  );
}

export async function getWritableContract(address, abi) {
  try {
    validateABI(abi, 'Contract');
    const signer = await getProviderOrSigner(true);
    return new ethers.Contract(address, abi, signer);
  } catch (error) {
    console.error('Error creating writable contract:', error);
    throw error;
  }
}

export async function getSparkRegistryWritable() {
  return getWritableContract(addresses.sparkRegistry, validateABI(SparkRegistryABI, 'SparkRegistry'));
}

export async function setupNetwork() {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.error('MetaMask not detected');
    return false;
  }
  
  try {
    
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('Current chain ID:', chainId);

    const HARDHAT_CHAIN_ID = '0x7a69';  
    const LOCALHOST_CHAIN_ID = '0x539';  

    if (chainId === HARDHAT_CHAIN_ID || chainId === LOCALHOST_CHAIN_ID) {
      console.log('Already on the correct network');
      return true;
    }

    console.log('Attempting to switch network...');
    try {
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: HARDHAT_CHAIN_ID }],
      });
      console.log('Successfully switched to Hardhat network');
      return true;
    } catch (switchError) {
      console.log('Switch error:', switchError);

      if (switchError.code === 4902 || switchError.message?.includes('wallet_addEthereumChain')) {
        
        try {
          console.log('Adding Hardhat network to wallet...');
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: HARDHAT_CHAIN_ID,
                chainName: 'Hardhat Node',
                rpcUrls: ['http://127.0.0.1:8545'],
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          });
          console.log('Successfully added Hardhat network');
          return true;
        } catch (addHardhatError) {
          console.error('Error adding Hardhat network:', addHardhatError);

          try {
            console.log('Adding Localhost network to wallet...');
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: LOCALHOST_CHAIN_ID,
                  chainName: 'Localhost 8545',
                  rpcUrls: ['http://127.0.0.1:8545'],
                  nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                },
              ],
            });
            console.log('Successfully added Localhost network');
            return true;
          } catch (addLocalhostError) {
            console.error('Error adding Localhost network:', addLocalhostError);
            throw new Error('Failed to switch or add network. Please manually switch to localhost network in your wallet.');
          }
        }
      } else {
        console.error('Failed to switch network:', switchError);
        throw new Error('Failed to switch network. User may have rejected the request.');
      }
    }
  } catch (error) {
    console.error('Network setup error:', error);

    alert(`Network Error: ${error.message}`);
    return false;
  }
}
