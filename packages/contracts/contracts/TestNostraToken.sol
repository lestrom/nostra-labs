// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestNostraToken is ERC20, Ownable {
    uint256 public mintAmount;
    uint256 constant public TOTAL_SUPPLY = 1000000000 * 10**18;  // 1 billion tokens with 18 decimals
    mapping(address => bool) public hasMinted;

    constructor(uint256 _initialMintAmount)
        ERC20("TestNostraToken", "tNST")
        Ownable(msg.sender)
    {
        mintAmount = _initialMintAmount;
    }

    function setMintAmount(uint256 _newMintAmount) external onlyOwner {
        mintAmount = _newMintAmount;
    }

    function mint() external {
        require(!hasMinted[msg.sender], "Already minted");
        require(totalSupply() + mintAmount <= TOTAL_SUPPLY, "Would exceed total supply");

        hasMinted[msg.sender] = true;
        _mint(msg.sender, mintAmount);
    }

    function ownerMint(uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= TOTAL_SUPPLY, "Would exceed total supply");
        _mint(msg.sender, amount);
    }
}
