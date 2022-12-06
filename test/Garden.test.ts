import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, BigNumber, Contract } from "ethers";

const price = "0.005";

describe("Garden contract", function () {
  let garden: Contract;
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

    it("Should revert if owner already owns a nft", async () => {
      await garden.mint({ value: ethers.utils.parseEther(price) })
      expect(await garden.mint({ value: ethers.utils.parseEther(price) })).to.be.revertedWith(
        "You already own max token."
      )
    });

    it("Should emit TokenMinted event", async () => {
      let gardenId: number = 2;
      expect(await garden
        .connect(addr1)
        .mint({ value: ethers.utils.parseEther(price) }))
        .to.emit(garden, "TokenMinted")
        .withArgs(owner.getAddress(), gardenId);
    });

  });
});
