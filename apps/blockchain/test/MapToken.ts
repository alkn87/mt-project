import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers } from 'hardhat';
import { expect } from 'chai';

describe("MapToken", function () {
  async function deployMapTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const MapToken = await ethers.getContractFactory("MapToken");
    const mapToken = await MapToken.deploy();

    return { mapToken, owner, otherAccount };
  }

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      const { mapToken, owner } = await loadFixture(deployMapTokenFixture);
      expect(await mapToken.owner()).to.equal(owner.address);
    });
  });

  describe('Minting', function () {
    it('Should revert if not called from contract owner', async function () {
      const { mapToken, owner, otherAccount } = await loadFixture(deployMapTokenFixture);
      await expect(mapToken.connect(otherAccount).mintToken(owner.address, 10)).to.be.reverted;
    });
    it('Should set correct balance for token receiver', async function () {
      const { mapToken, owner, otherAccount } = await loadFixture(deployMapTokenFixture);
      await expect(mapToken.mintToken(otherAccount.address, 10)).not.to.be.reverted;
      expect(await mapToken.balanceOf(otherAccount.address)).to.equal(10);
    });
  });

});
