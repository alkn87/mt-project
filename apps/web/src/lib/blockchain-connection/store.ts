import { getMapClaimContract, getVerificationOracleContract } from './connection';
import { ethers } from 'ethers';

export function getWriteMapClaimContract() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return getMapClaimContract().connect(signer);
}

export async function getWriteVerificationOracleContract() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = await getVerificationOracleContract();
  return contract.connect(signer);
}

export function getCurrentSigner() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  return provider.getSigner();
}
