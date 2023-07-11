import { ethers } from 'hardhat';
import { deploymentAddressesBuilder } from './util';

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  const lockedAmount = ethers.parseEther("1");

  const Lock = await ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  await lock.waitForDeployment();

  const MapClaim = await ethers.getContractFactory("MapClaim");
  const mapClaim = await MapClaim.deploy();

  await mapClaim.waitForDeployment();

  deploymentAddressesBuilder.addDeployment('Lock', await lock.getAddress());
  deploymentAddressesBuilder.addDeployment('MapClaim', await mapClaim.getAddress());
  deploymentAddressesBuilder.generateDeploymentAddressesFile();

  console.log(`Lock with 1 ETH and unlock timestamp ${unlockTime} deployed to ${ await lock.getAddress()}`);
  console.log(`MapClaim deployed to ${ await mapClaim.getAddress()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
