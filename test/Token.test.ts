import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, BigNumber, Contract } from "ethers";

const price = "0.005";
const tokenPrice = "0.001"

describe("Token contract", function () {
  let garden: Contract,
    token: Contract;
  let owner: Signer, 
    addr1: Signer, 
    addr2: Signer, 
    addrs: Signer[];

  before(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    const baseURI = "ipfs/XXX/";

    const Garden = await ethers.getContractFactory("Garden");
    garden = await Garden.deploy(baseURI);
    await garden.deployed();

    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(garden.address);
    await token.deployed();
  })

  describe("Garden", () => {
    it("Mint should increase the supply", async () => {
      await garden.mint({ value: ethers.utils.parseEther(price) });
      expect(await garden.totalSupply()).to.equal(1);
    });

    it("Owner should owns the nft", async () => {
      let gardenId: number = 1;
      expect(await garden.ownerOf(gardenId)).to.equal(await owner.getAddress());
    });
  });

  describe("Token", () => {
    it("Garden owner should claim free tokens", async () => {
      let claimableTokensWithDecimals: number = 10 * Math.pow(10, 18);
      await token.claim();
      expect(await token.balanceOf(await owner.getAddress())).to.equal(BigInt(claimableTokensWithDecimals));
    });

    it("Should buy tokens", async () => {
      let amount = 25;
      let amountWithDecimals = 25 * Math.pow(10, 18);
      let price = amount * parseFloat(tokenPrice);
      
      await token.connect(addr1).buy(amount, { value: ethers.utils.parseEther(price.toString()) });
      expect(await token.balanceOf(await addr1.getAddress())).to.equal(BigInt(amountWithDecimals));
    });

    it("Should emit TokensBought event", async () => {
      let amount = 25;
      let price = amount * parseFloat(tokenPrice);
      expect(await token
        .connect(addr1)
        .buy(amount, { value: ethers.utils.parseEther(price.toString()) }))
        .to.emit(garden, "TokensBought")
        .withArgs(owner.getAddress(), amount);
    });

  });
});
