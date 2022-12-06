// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DEX is ERC20, ReentrancyGuard, Pausable, Ownable {
    address public immutable tokenAddress;

    constructor(address _tokenAddress) ERC20("My Dream Garden LP Token", "MDGLP") {
        require(_tokenAddress != address(0), "Token address passed is a null address");
        tokenAddress = _tokenAddress;
    }

    function getReserve() public view returns (uint256) {
        return ERC20(tokenAddress).balanceOf((address(this)));
    }

    function getAmountOfTokens(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "Invalid reserves");
        // 1% of fee
        uint256 inputAmountWithFee = inputAmount * 99;
        // X * Y = K curve
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 100) + inputAmountWithFee;
        return numerator / denominator;
    }

    function addLiquidity(uint256 _amount) public payable returns (uint256) {
        uint256 liquidity;
        uint256 ethBalance = address(this).balance;
        uint256 tokenReserve = getReserve();
        ERC20 token = ERC20(tokenAddress);

        if(tokenReserve == 0) {
            token.transferFrom(msg.sender, address(this), _amount);
            liquidity = ethBalance;
            _mint(msg.sender, liquidity);
        } else {
            // Maintain a ratio to not impact the price when someone adds liquidity
            // Ratior decides how much tokens user can supply given a certain amount of ETH.
            uint256 ethReserve = ethBalance - msg.value;
            // (tokenAmount user can add) = (ETh sent by the user * token reserve / ETH reserve)
            uint256 proportionalTokenAmount = (msg.value * tokenReserve) / ethReserve;
            require(_amount >= proportionalTokenAmount, "Incorrect ratio of tokens provided");
            token.transferFrom(msg.sender, address(this), proportionalTokenAmount);
            // Provide LP to keep track of the amount of liquidity that a user supplied to the contract.abi
            // LP tokens are proportional to the ETH supplied by the user.
            // liqudity = (total supply of LP tokens in contract * ETH sent by the user / ETH reserve in the contract
            liquidity = (totalSupply() * msg.value) / ethReserve;
            _mint(msg.sender, liquidity);
        }
        return liquidity;
    }

    function removeLiquidity(uint256 _amount) public returns (uint256, uint256) {
        require(_amount > 0, "Amount should be greather than zero");
        uint256 ethReserve = address(this).balance;
        uint256 _totalSupply = totalSupply();
        // ETH sent back to the user = (current ETH reserve * amount of LP tokens that user wants to withdraw)
        // / (total supply of LP tokens)
        uint256 ethAmount = (ethReserve * _amount) / _totalSupply;
        // Tokens sent back to the user = (current tokens reserve * amount of LP tokens that user wants to withdraw)
        // / (total supply of LP tokens)
        uint256 tokenAmount = (getReserve() * _amount) / _totalSupply;
        _burn(msg.sender, _amount);
        (bool success,) = msg.sender.call{value: ethAmount}("");
        require(success, "Failed to transfer");
        ERC20(tokenAddress).transfer(msg.sender, tokenAmount);
        return (ethAmount, tokenAmount);
    }

    function ethToToken(uint256 _minTokens) public payable {
        uint256 tokenReserve = getReserve();
        uint256 tokensBought = getAmountOfTokens(
            msg.value, 
            address(this).balance - msg.value,
            tokenReserve
        );
        require(tokensBought >= _minTokens, "Insufficient output amount");
        ERC20(tokenAddress).transfer(msg.sender, tokensBought);
    }

    function tokenToEth(uint256 _tokensSold, uint256 _minEth) public {
        uint256 tokenReserve = getReserve();
        uint256 ethBought = getAmountOfTokens(
            _tokensSold, 
            tokenReserve,
            address(this).balance
        );
        require(ethBought >= _minEth, "Insufficient output amount");
        ERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this), 
            _tokensSold
        );
        (bool success, ) = msg.sender.call{value: ethBought}("");
        require(success, "Failed to send Ether");
    }
}