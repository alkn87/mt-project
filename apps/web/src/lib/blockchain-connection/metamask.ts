import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';

async function getMetamaskProvider() {
  const metamaskProvider = await detectEthereumProvider({ mustBeMetaMask: true });
  if (!metamaskProvider) {
    throw new Error('Could not detect Metamask');
  }
  return new ethers.BrowserProvider(window.ethereum);
}

/**
 * @returns all connected metamask accounts
 */
export async function getAccounts(): Promise<string[]> {
  const provider = await getMetamaskProvider();
  return (await provider.send('eth_accounts', [])) as Array<string>;
}

/**
 * This method silently (without a popup) as
 * @returns true if and only if metamask is connected with at least one account
 */
export async function isMetamaskConnected(): Promise<boolean> {
  const accounts = await getAccounts();
  return accounts.length !== 0;
}

/**
 *
 * @returns all connected accounts
 * @throws an error if the user denies the request to connect some accounts
 */
export async function connectAccounts(): Promise<string[]> {
  const provider = await getMetamaskProvider();
  let accounts;
  try {
    accounts = (await provider.send('eth_requestAccounts', [])) as Array<string>;
  } catch (e) {
    throw new Error('User denied the request');
  }
  return accounts;
}

/**
 *
 * @param chainId The chainId the user should be connected to in hex format prefixed with '0x'
 * @returns true if and only if the chainId from metamask is equal to the provided chainId
 */
export async function isConnectedToCorrectChain(chainId: string): Promise<boolean> {
  const provider = await getMetamaskProvider();
  const currentChainId = await provider.send('eth_chainId', []);
  return chainId === currentChainId;
}

/**
 * This method tries to switch/add the newtork for the user.
 *
 * First it is attempted to switch the network.
 * If the network is not added yet it is tried to add the newtork
 * After adding the network metamask automatically asks the user if they want to switch to the newly added network
 * If the user declines at any point an error is thrown.
 *
 * @param chain The chain Parameters as specified in [EIP-3085](https://eips.ethereum.org/EIPS/eip-3085)
 * @throws an error if at any pint the user declines a prompt
 */
export async function switchAndAddEthereumChain(chain: AddEthereumChainParameter): Promise<void> {
  const provider = await getMetamaskProvider();
  try {
    await provider.send('wallet_switchEthereumChain', [{ chainId: chain.chainId }]);
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if ((switchError as { code: number }).code !== 4902) {
      throw new Error('Undefined error switching network');
    }
    try {
      await provider.send('wallet_addEthereumChain', [chain]);
    } catch (addError) {
      throw new Error('User denied the request');
    }

    const chainId = await provider.send('eth_chainId', []);
    if (chainId !== chain.chainId) {
      throw new Error('User did not switch the network');
    }
  }
}

/**
 * As specified in [EIP-3085](https://eips.ethereum.org/EIPS/eip-3085)
 */
export interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored.
}

export const LOCAL_CHAIN: AddEthereumChainParameter = {
  chainId: '0x7a69',
  chainName: 'Localhost',
  nativeCurrency: {
    name: 'TestEther',
    symbol: 'GO',
    decimals: 18
  },
  rpcUrls: ['http://127.0.0.1:8545/']
};

export const GOERLI: AddEthereumChainParameter = {
  chainId: '0x5',
  chainName: 'Goerli test network',
  nativeCurrency: {
    name: 'GoerliETH',
    symbol: 'GoerliETH',
    decimals: 18
  },
  rpcUrls: ['https://goerli.infura.io/v3/']
};

export const NETWORK = LOCAL_CHAIN
