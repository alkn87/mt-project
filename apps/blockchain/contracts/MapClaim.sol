// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import "@openzeppelin/contracts/utils/Strings.sol";
import './MapToken.sol';
import './MockMintStrikeOracle.sol';
import './VerificationOracle.sol';

contract MapClaim is ERC721Enumerable, Ownable, ReentrancyGuard, AccessControl {

    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    using Counters for Counters.Counter;
    Counters.Counter private _mapClaimIds;

    enum MapClaimStatus {CREATED, ACTIVATED, VERIFIED, REJECTED, REWARDED}

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

    modifier onlyVerifiers() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Restricted to verifiers.");
        require(hasRole(VERIFIER_ROLE, msg.sender), "Restricted to verifiers.");
        _;
    }

    constructor() ERC721('MapClaim', 'MAPC') {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
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
        require(_mapClaimTokens[tokenIndex[mapClaimId]].status == MapClaimStatus.ACTIVATED, string.concat('Map claim is not activated! - ', Strings.toString(mapClaimId)));
        _mapClaimTokens[tokenIndex[mapClaimId]].status = MapClaimStatus.VERIFIED;
        emit MapClaimEvent(MapClaimStatus.VERIFIED, mapClaimId);
    }

    function rewardClaim(uint256 mapClaimId) public onlyVerifiers {
        require(_exists(mapClaimId), 'Map claim does not exist!');
        require(_mapClaimTokens[tokenIndex[mapClaimId]].status == MapClaimStatus.VERIFIED, string.concat('Map claim is not verified! - ', Strings.toString(mapClaimId)));
        require(ownerOf(mapClaimId) != msg.sender, 'Map claim belonging to own address cannot be rewarded!');
        _mapClaimTokens[tokenIndex[mapClaimId]].status = MapClaimStatus.REWARDED;
        mapToken.mintToken(ownerOf(mapClaimId), 10);
        if (checkVerifierStatusReached(msg.sender)) {
            _grantRole(VERIFIER_ROLE, msg.sender);
        }
        emit MapClaimEvent(MapClaimStatus.REWARDED, mapClaimId);
    }

    function rejectClaim(uint256 mapClaimId) public onlyVerifiers {
        require(_exists(mapClaimId), 'Map claim does not exist!');
        require(_mapClaimTokens[tokenIndex[mapClaimId]].status == MapClaimStatus.VERIFIED, string.concat('Map claim is not verified! - ', Strings.toString(mapClaimId)));
        require(ownerOf(mapClaimId) != msg.sender, 'Map claim belonging to own address cannot be rewarded!');
        _mapClaimTokens[tokenIndex[mapClaimId]].status = MapClaimStatus.REJECTED;
        emit MapClaimEvent(MapClaimStatus.REJECTED, mapClaimId);
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

    function getAllMapClaims() public view onlyVerifiers returns (MapClaimToken[] memory) {
        return _mapClaimTokens;
    }

    function getVerificationOracleContractAddress() public view onlyOwner returns (address) {
        return address(verificationOracle);
    }

    function getMapTokenContractAddress() public view onlyOwner returns (address) {
        return address(mapToken);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function checkVerifierStatusReached(address mapClaimOwner) public view onlyOwner returns (bool) {
        uint256 balance = balanceOf(mapClaimOwner);
        uint8 numberOfRewardedMapClaims = 0;
        for (uint256 index = 0; index < balance; index++) {
            if (_mapClaimTokens[tokenIndex[tokenOfOwnerByIndex(mapClaimOwner, index)]].status == MapClaimStatus.REWARDED) {
                numberOfRewardedMapClaims++;
            }
        }
        if (numberOfRewardedMapClaims >= 3) {
            return true;
        } else {
            return false;
        }
    }

    function getNumberOfRewardedMapClaims(address mapClaimOwner) public view onlyOwner returns (uint256) {
        uint256 balance = balanceOf(mapClaimOwner);
        uint8 numberOfRewardedMapClaims = 0;
        for (uint256 index = 0; index < balance; index++) {
            MapClaimToken memory mapClaim = _mapClaimTokens[tokenIndex[tokenOfOwnerByIndex(mapClaimOwner, index)]];
            if (mapClaim.status == MapClaimStatus.REWARDED) {
                numberOfRewardedMapClaims++;
            }
        }
        return numberOfRewardedMapClaims;
    }
}
