// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract MapToken is ERC20Burnable, Ownable {
    constructor() ERC20('MapToken', 'MAPT') {}

    function mintToken(address tokenReceiver, uint256 amount) public onlyOwner {
        _mint(tokenReceiver, amount);
    }

    function expireToken(address tokenOwner, uint256 amount) public onlyOwner {
        _burn(tokenOwner, amount);
    }
}
