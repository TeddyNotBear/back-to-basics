import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, BigNumber, Contract } from "ethers";

const price = "0.005";
const icoPrice = "0.001"

describe("All contracts", function () {
  let nft: Contract,
    ico: Contract;
  let owner: Signer, 
    addr1: Signer, 
    addr2: Signer, 
    addrs: Signer[];

  before(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    const baseURI = "ipfs/XXX/";

    const NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy(baseURI);
    await nft.deployed();

    const ICO = await ethers.getContractFactory("ICO");
    ico = await ICO.deploy(nft.address);
    await ico.deployed();
  })

  describe("NFT", () => {
    it("Mint should increase the supply", async () => {
      await nft.mint({ value: ethers.utils.parseEther(price) });
      expect(await nft.totalSupply()).to.equal(1);
    });

    it("Owner should owns the nft", async () => {
      let nftId: number = 1;
      expect(await nft.ownerOf(nftId)).to.equal(await owner.getAddress());
    });
  });

  describe("ICO", () => {
    it("NFT owner should claim free tokens", async () => {
      let claimableicosWithDecimals: number = 10 * Math.pow(10, 18);
      await ico.claim();
      expect(await ico.balanceOf(await owner.getAddress())).to.equal(BigInt(claimableicosWithDecimals));
    });

    it("Should buy tokens", async () => {
      let amount = 25;
      let amountWithDecimals = 25 * Math.pow(10, 18);
      let price = amount * parseFloat(icoPrice);
      
      await ico.connect(addr1).buy(amount, { value: ethers.utils.parseEther(price.toString()) });
      expect(await ico.balanceOf(await addr1.getAddress())).to.equal(BigInt(amountWithDecimals));
    });

    it("Should emit TokensBought event", async () => {
      let amount = 25;
      let price = amount * parseFloat(icoPrice);
      await expect(ico
        .connect(addr1)
        .buy(amount, { value: ethers.utils.parseEther(price.toString()) }))
        .to.emit(ico, "TokensBought")
        .withArgs(await addr1.getAddress(), amount);
    });

  });
});
