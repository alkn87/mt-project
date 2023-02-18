// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/access/Ownable.sol';
/*
.@title MockMintStrikeOracle to return random mint strike
.@notice This smart contract is used as an oracle for development.
It's purpose is to generate a random number which is used
in the process of mint striking in OpenStreetMap to verify
that the claim holder is actually the one who contributed data.
Truly random numbers need a more sophisticated implementation.
In production use service providers like https://docs.chain.link/vrf/v2/introduction/
*/
contract MockMintStrikeOracle is Ownable {
    constructor() {

    }

    function getMintStrike() public view onlyOwner returns (uint) {
        uint randomHash = uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp)));
        return randomHash % 1000;
    }
}
