import { ethers } from 'ethers';

import {
  MapClaim__factory,
  deploymentAddresses,
  type MapClaim,
  VerificationOracle__factory,
  type VerificationOracle
} from 'blockchain';

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


export function getProvider() {
  // If you don't specify a //url//, Ethers connects to the default
  // (i.e. ``http:/\/localhost:8545``)
  return new ethers.JsonRpcProvider(LOCAL_CHAIN.rpcUrls[0]);
}

export function getMapClaimContract(): MapClaim {
  return MapClaim__factory.connect(deploymentAddresses.MapClaim, getProvider());
}

export async function getVerificationOracleContract(): Promise<VerificationOracle> {
  return VerificationOracle__factory.connect(await getMapClaimContract().getVerificationOracleContractAddress(), getProvider());
}
