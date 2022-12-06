import { ethers, network } from "hardhat";
import { verify } from "./utils/verify";

async function main() {
  const baseURI = 'ipfs://QmW23DXT81LDyjzyPGX2LVhRaW2FhGHKgdKi2p6ieTbHU7/';
  const Garden = await ethers.getContractFactory("Garden");
  const garden = await Garden.deploy(baseURI);
  await garden.deployed();
  console.log(`Garden contract deployed to ${garden.address}`);

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy(garden.address);
  await token.deployed();
  console.log(`Token contract deployed to ${token.address}`);

  if(network.name === "polygon_mumbai") {
    console.log("Verifiying the smart contract...");
    // Wait 6 blocks
    await garden.deployTransaction.wait(6);
    await verify(garden.address, [baseURI]);
    await token.deployTransaction.wait(6);
    await verify(token.address, [garden.address]);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
