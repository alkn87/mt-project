import {ethers} from 'ethers';

import {
  MapClaim__factory,
  deploymentAddresses,
  type MapClaim,
  VerificationOracle__factory,
  type VerificationOracle
} from 'blockchain';
import { NETWORK } from './metamask';
export function getProvider() {
  // If you don't specify a //url//, Ethers connects to the default
  // (i.e. ``http:/\/localhost:8545``)
  return new ethers.JsonRpcProvider(NETWORK.rpcUrls[0]);
}

export function getMapClaimContract(): MapClaim {
  return MapClaim__factory.connect(deploymentAddresses.MapClaim, getProvider());
}
