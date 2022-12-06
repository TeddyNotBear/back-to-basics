// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Token is ERC20, ReentrancyGuard, Pausable, Ownable {
    IERC721Enumerable public immutable garden;

    uint256 public tokenPrice = 0.001 ether;
    // NFT owner can claim 10 My Dream Garden Token
    uint256 public claimableTokens = 10 * 10**18;
    // A max token supply of 10 000 My Dream Garden Token
    uint256 public maxTokenSupply = 10000 * 10**18;
    // A max amount of token per wallet of 100 My Dream Garden Token
    uint256 public maxAmountPerWallet = 100 * 10**18;

    mapping(uint256 => bool) public tokenIdsClaimed;

    modifier onlyGardenOwner() {
        require(garden.balanceOf(msg.sender) > 0, "You must own a NFT");
        _;
    }

    event TokensClaimed(address indexed _owner, uint256 indexed _amount);
    event TokensBought(address indexed _owner, uint256 indexed _amount);

    constructor(IERC721Enumerable _garden) ERC20("My Dream Garden Token", "MDGT") {
        garden = _garden;
    }

    function claim() external nonReentrant whenNotPaused onlyGardenOwner {
        uint256 balance = garden.balanceOf(msg.sender);
        uint256 amount = 0;
        for (uint i = 0; i < balance; i++) {
            uint256 tokenId = garden.tokenOfOwnerByIndex(msg.sender, i);
            if(!tokenIdsClaimed[tokenId]) {
                amount++;
                tokenIdsClaimed[tokenId] = true;
            }
        }
        require(amount > 0, "You have already claimed all the tokens");
        _mint(msg.sender, amount * claimableTokens);
        emit TokensClaimed(msg.sender, amount * claimableTokens);
    }

    function buy(uint256 _amount) external payable nonReentrant whenNotPaused {
        uint256 amountWithDecimals = _amount * 10**18;
        require(maxAmountPerWallet >= balanceOf(msg.sender) + amountWithDecimals, "You have reached the purchase limit");
        require(msg.value >= tokenPrice * _amount, "You don't have enough ether to buy this amount of token");
        require(maxTokenSupply >= totalSupply() + amountWithDecimals, "Exceeds the max total supply available");
        _mint(msg.sender, amountWithDecimals);
        emit TokensBought(msg.sender, _amount);
    }

    function withdraw() external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "Nothing to withdraw, contract balance empty");
        address _owner = owner();
        (bool success, ) = _owner.call{value: amount}("");
        require(success, "Failed to send Ether");
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
}