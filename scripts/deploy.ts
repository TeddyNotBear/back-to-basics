import { ethers, network } from "hardhat";
import { verify } from "./utils/verify";

async function main() {
  const baseURI = 'ipfs://QmW23DXT81LDyjzyPGX2LVhRaW2FhGHKgdKi2p6ieTbHU7/';
  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(baseURI);
  await nft.deployed();
  console.log(`NFT contract deployed to ${nft.address}`);

  const ICO = await ethers.getContractFactory("ICO");
  const ico = await ICO.deploy(nft.address);
  await ico.deployed();
  console.log(`ICO contract deployed to ${ico.address}`);

  if(network.name === "polygon_mumbai") {
    console.log("Verifiying the smart contract...");
    // Wait 6 blocks
    await nft.deployTransaction.wait(6);
    await verify(nft.address, [baseURI]);
    await ico.deployTransaction.wait(6);
    await verify(ico.address, [nft.address]);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
