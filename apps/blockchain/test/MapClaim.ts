import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { EthersProviderWrapper } from '@nomiclabs/hardhat-ethers/internal/ethers-provider-wrapper';
import { VerifyMintStrikeOracleMock } from './VerifyMintStrikeOracleMock';

describe("MapClaim", function () {
  async function deployMapClaimFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    // Reset default ethers polling interval to speed up tests with event listening
    const ownerProvider = owner.provider as EthersProviderWrapper;
    ownerProvider.pollingInterval = 100;

    const MapClaim = await ethers.getContractFactory("MapClaim");
    const mapClaim = await MapClaim.deploy();

    const VerificationOracle = await ethers.getContractFactory('VerificationOracle');
    const verificationOracle = VerificationOracle.attach(await mapClaim.getVerificationOracleContractAddress());

    // Reset default ethers polling interval to speed up tests with event listening
    const verificationOracleProvider = verificationOracle.provider as EthersProviderWrapper;
    verificationOracleProvider.pollingInterval = 100;

    return { mapClaim, verificationOracle, owner, otherAccount };
  }

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      const { mapClaim, owner } = await loadFixture(deployMapClaimFixture);
      expect(await mapClaim.owner()).to.equal(owner.address);
    });
  });

  describe('Minting', function () {
    it('Should create a new MapClaim Token', async function () {
      const { mapClaim, owner, otherAccount } = await loadFixture(deployMapClaimFixture);
      await expect(mapClaim.createMapClaim('max')).not.to.be.reverted;
      await expect(mapClaim.connect(otherAccount).createMapClaim('moritz')).not.to.be.reverted;
      console.log(await mapClaim.getMintStrike(1, "max"));
      console.log(await mapClaim.connect(otherAccount).getMintStrike(2, "moritz"));
    });
    it('Should not allow to get a mint strike when not owner of token', async function () {
      const { mapClaim, owner, otherAccount } = await loadFixture(deployMapClaimFixture);
      await mapClaim.createMapClaim('max');
      await mapClaim.connect(otherAccount).createMapClaim('moritz');
      await expect(mapClaim.getMintStrike(2, 'moritz')).to.be.revertedWith('You are not allowed to obtain a mint strike!');
    });
  });

  describe('Integration', function () {
    it('Should trigger oracle verification event', async function () {
      const { mapClaim, verificationOracle, owner, otherAccount } = await loadFixture(deployMapClaimFixture);
      await expect(mapClaim.createMapClaim('max')).to.emit(mapClaim, 'MapClaimEvent');

      let mapClaimStatus;
      let mapClaimId = 99; // some invalid tokenId for initialization

      mapClaim.on('MapClaimEvent', async (status, id) => {
        mapClaimStatus = status;
        mapClaimId = id;

      });

      let verificationOracleOwnerAddress;
      let verificationOracleMintStrike;
      let verificationOracleChangeSetId;
      let verificationOracleMapUserName;

      verificationOracle.on('VerifyMintStrike', async (ownerAddress, mintStrike, changeSetId, mapUserName) => {
        verificationOracleOwnerAddress = ownerAddress;
        verificationOracleMintStrike = mintStrike;
        verificationOracleChangeSetId = changeSetId;
        verificationOracleMapUserName = mapUserName;
      });

      // add timeout to catch fired events
      await new Promise(res => setTimeout(() => res(null), 800));

      await mapClaim.activateClaim(mapClaimId, 132);

      // add timeout to catch fired events
      await new Promise(res => setTimeout(() => res(null), 800));

      expect(verificationOracleOwnerAddress).to.equal(mapClaim.address);
      expect(verificationOracleChangeSetId).to.equal(132);
      expect(verificationOracleMapUserName).to.equal('max');
      expect(verificationOracleMintStrike).to.be.greaterThan(0);

      expect(VerifyMintStrikeOracleMock.verify(
        verificationOracleMintStrike as unknown as number,
        verificationOracleChangeSetId as unknown as number,
        verificationOracleMapUserName as unknown as string)).to.be.true;
    });
  });

});
