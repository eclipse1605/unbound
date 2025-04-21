import { ethers } from 'ethers';

export const setupNetwork = async () => {
  try {
    if (!window.ethereum) {
      console.error('No ethereum provider found. Please install MetaMask.');
      return false;
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length === 0) {
      console.error('No accounts available');
      return false;
    }

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== '0x7a69') { 
      try {
        
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7a69' }], 
        });
      } catch (switchError) {
        
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7a69',
                chainName: 'Hardhat Local',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['http://127.0.0.1:8545'],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to setup network:', error);
    return false;
  }
}; 