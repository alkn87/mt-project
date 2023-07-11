import { getMapClaimContract } from './connection';
import { ethers } from 'ethers';

export async function getWriteMapClaimContract() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return getMapClaimContract().connect(signer);
}

export function getCurrentSigner() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner();
}
