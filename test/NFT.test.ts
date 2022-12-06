import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, BigNumber, Contract } from "ethers";

const price = "0.005";

describe("NFT contract", function () {
  let nft: Contract;
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

    it("Should revert if owner already owns a nft", async () => {
      await nft.mint({ value: ethers.utils.parseEther(price) })
      expect(await nft.mint({ value: ethers.utils.parseEther(price) })).to.be.revertedWith(
        "You already own max token."
      )
    });

    it("Should emit TokenMinted event", async () => {
      let nftId: number = 2;
      expect(await nft
        .connect(addr1)
        .mint({ value: ethers.utils.parseEther(price) }))
        .to.emit(nft, "TokenMinted")
        .withArgs(owner.getAddress(), nftId);
    });

  });
});
