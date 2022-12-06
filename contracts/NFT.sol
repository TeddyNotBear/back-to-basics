// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NFT is ERC721Enumerable, ReentrancyGuard, Pausable, Ownable {
    using Strings for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    string setBaseURI;
    uint256 public price = 0.005 ether;
    uint256 public maxToken = 10;

    mapping(address => uint256) public tokens;

    event TokenMinted(address indexed _owner, uint256 indexed _id);

    constructor(string memory baseURI) ERC721("My Dream Garden Collection", "MDGC") {
        setBaseURI = baseURI;
    }

    function mint() external payable nonReentrant whenNotPaused {
        uint256 totalTokens = totalSupply();

        require(tokens[msg.sender] < 2, "You already own max token.");
        require(totalTokens <= maxToken, "No token lefts.");
        require(msg.value >= price, "You don't have enough ETH to pay a token.");

        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();

        _safeMint(msg.sender, tokenId);
        require(ownerOf(tokenId) == msg.sender, "Mint failed");

        tokens[msg.sender]++;

        emit TokenMinted(msg.sender, tokenId);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return setBaseURI;
    }

    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        _requireMinted(_tokenId);

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 
        ? string(abi.encodePacked(baseURI, _tokenId.toString(), ".json")) 
        : "";
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