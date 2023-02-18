// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import "@openzeppelin/contracts/utils/Strings.sol";
import './MapToken.sol';
import './MockMintStrikeOracle.sol';
import './VerificationOracle.sol';

contract MapClaim is ERC721Enumerable, Ownable, ReentrancyGuard {

    using Counters for Counters.Counter;
    Counters.Counter private _mapClaimIds;

    enum MapClaimStatus { CREATED, ACTIVATED, VERIFIED, REJECTED, REWARDED }

    struct MapClaimToken {
        uint256 mintStrike;
        string mapUserName;
        uint256 mapClaimId;
        MapClaimStatus status;
    }

    mapping(uint256 => uint256) private tokenIndex;

    event MapClaimEvent(MapClaimStatus status, uint256 mapClaimId);

    MapClaimToken[] private _mapClaimTokens;
    MockMintStrikeOracle mockMintStrikeOracle;
    MapToken mapToken;
    VerificationOracle verificationOracle;


    constructor() ERC721('MapClaim', 'MAPC') {
        mockMintStrikeOracle = new MockMintStrikeOracle();
        mapToken = new MapToken();
        verificationOracle = new VerificationOracle();
    }

    function createMapClaim(string memory mapUserName) public {
        _mapClaimIds.increment();
        uint256 newMapClaimTokenId = _mapClaimIds.current();
        _mint(msg.sender, _mapClaimIds.current());
        uint256 mintStrike = mockMintStrikeOracle.getMintStrike();
        _mapClaimTokens.push(
            MapClaimToken({
                mintStrike: mintStrike,
                mapUserName: mapUserName,
                mapClaimId: newMapClaimTokenId,
                status: MapClaimStatus.CREATED
            })
        );
        tokenIndex[newMapClaimTokenId] = _mapClaimTokens.length - 1;
        emit MapClaimEvent(MapClaimStatus.CREATED, newMapClaimTokenId);
    }

    function activateClaim(uint256 mapClaimId, uint256 changeSetId) public {
        require(_exists(mapClaimId), 'Map claim does not exist!');
        require(ownerOf(mapClaimId) == msg.sender, 'You are not allowed to activate this claim!');
        require(_mapClaimTokens[tokenIndex[mapClaimId]].status == MapClaimStatus.CREATED, 'Map claim was already activated!');
        _mapClaimTokens[tokenIndex[mapClaimId]].status = MapClaimStatus.ACTIVATED;
        verificationOracle.verifyMintStrike(
             mapClaimId,
            _mapClaimTokens[tokenIndex[mapClaimId]].mintStrike,
            changeSetId,
            _mapClaimTokens[tokenIndex[mapClaimId]].mapUserName);
    }

    function verifyClaim(uint256 mapClaimId) public onlyOwner {
        require(_exists(mapClaimId), 'Map claim does not exist!');
        require(_mapClaimTokens[tokenIndex[mapClaimId]].status == MapClaimStatus.ACTIVATED, string.concat( 'Map claim is not activated! - ', Strings.toString(mapClaimId)));
        _mapClaimTokens[tokenIndex[mapClaimId]].status = MapClaimStatus.VERIFIED;
        emit MapClaimEvent(MapClaimStatus.VERIFIED, mapClaimId);
    }

    function getMintStrike(uint256 mapClaimId, string memory mapUserName) public view returns (uint) {
        require(ownerOf(mapClaimId) == msg.sender, 'You are not allowed to obtain a mint strike!');
        return _mapClaimTokens[tokenIndex[mapClaimId]].mintStrike;
    }

    function getMapClaimById(uint256 mapClaimId) public view returns (MapClaimToken memory) {
        require(_exists(mapClaimId), 'Token does not exist!');
        require(ownerOf(mapClaimId) == msg.sender, 'You are not the token owner!');
        return _mapClaimTokens[tokenIndex[mapClaimId]];
    }

    function getVerificationOracleContractAddress() public view onlyOwner returns (address) {
        return address(verificationOracle);
    }

    function getMapTokenContractAddress() public view onlyOwner returns (address) {
        return address(mapToken);
    }
}
