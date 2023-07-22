// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';

contract VerificationOracle is Ownable {
    constructor(){}

    event VerifyMintStrike(address senderAddress, uint mintStrike, uint changeSetId, string mapUserName, uint256 mapClaimId);

    function verifyMintStrike(uint mapClaimId, uint mintStrike, uint changeSetId, string memory mapUserName) public onlyOwner {
        emit VerifyMintStrike(owner(), mintStrike, changeSetId, mapUserName, mapClaimId);
    }

}
