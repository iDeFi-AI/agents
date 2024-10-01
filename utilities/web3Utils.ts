import Web3 from 'web3';

// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum?: any; // Define a broader type for ethereum
  }
}

// Initialize a Web3 instance
let web3: Web3 | null = null;

// Function to connect to the wallet and initialize web3
export const connectWallet = async (providerName: string): Promise<string[] | null> => {
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      let provider;
      if (providerName === "MetaMask") {
        provider = window.ethereum.providers.find((p: any) => p.isMetaMask);
      } else if (providerName === "CoinbaseWallet") {
        provider = window.ethereum.providers.find((p: any) => p.isCoinbaseWallet);
      }

      if (provider) {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        web3 = new Web3(provider);
        return accounts;
      } else {
        console.error('No provider selected or provider not available');
        return null;
      }
    } else {
      console.error('No Ethereum wallet is installed');
      return null;
    }
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return null;
  }
};

// Function to allow the user to select a provider if multiple are available
const selectProvider = async (providers: any[]): Promise<any | null> => {
  for (const provider of providers) {
    // Identify provider types (MetaMask, Coinbase, etc.)
    if (provider.isMetaMask) {
      return provider; // Prefer MetaMask if available
    } else if (provider.isCoinbaseWallet) {
      return provider;
    }
  }
  // Return the first provider if no preferred provider is found
  return providers.length > 0 ? providers[0] : null;
};

// Function to disconnect the wallet
export const disconnectWallet = async (): Promise<void> => {
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      const providers = window.ethereum.providers || [window.ethereum];
      for (const provider of providers) {
        if (provider.isMetaMask || provider.isCoinbaseWallet) {
          // Forcing disconnect might require custom logic, like resetting accounts or chains
          try {
            await provider.request({
              method: 'wallet_requestPermissions',
              params: [{ eth_accounts: {} }]
            });
          } catch (error) {
            console.error('Error disconnecting wallet:', error);
          }
        }
      }
    }
    web3 = null;
  } catch (error) {
    console.error('General error disconnecting wallet:', error);
  }
};

// Function to sync wallet data for multiple accounts
export const syncWalletData = async (accounts: string[]): Promise<void> => {
  try {
    for (const account of accounts) {
      console.log(`Syncing data for account: ${account}`);
      // Implement actual data synchronization logic here
      // This could involve fetching balances, transaction history, etc.
    }
  } catch (error) {
    console.error('Error syncing wallet data:', error);
  }
};

// web3Utils.ts
export const signMessage = async (message: string): Promise<string> => {
  try {
    if (web3 && typeof window !== 'undefined' && window.ethereum) {
      const accounts = await web3.eth.getAccounts();
      if (accounts && accounts.length > 0) {
        const signature = await web3.eth.personal.sign(message, accounts[0], "");
        return signature;
      } else {
        throw new Error('No accounts available for signing');
      }
    } else {
      throw new Error('Web3 is not initialized or Ethereum is not available');
    }
  } catch (error) {
    console.error('Error signing message:', error);
    throw new Error('Failed to sign message');
  }
};

// Export the default web3 instance
export default web3;
