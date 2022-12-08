import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, BigNumber, Contract } from "ethers";

const price = "0.005";
const icoPrice = "0.001"

describe("All contracts", function () {
    let nft: Contract,
    ico: Contract,
    dex: Contract;
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

    const DEX = await ethers.getContractFactory("DEX");
    dex = await DEX.deploy(ico.address);
    await dex.deployed();
    })

    describe("ICO", () => {
        it("Should buy tokens", async () => {
            let amount = 100;
            let amountWithDecimals = amount * Math.pow(10, 18);
            let price = amount * parseFloat(icoPrice);

            await ico.connect(addr1).buy(amount, { value: ethers.utils.parseEther(price.toString()) });
            expect(await ico.balanceOf(await addr1.getAddress())).to.equal(BigInt(amountWithDecimals));
            await ico.buy(amount, { value: ethers.utils.parseEther(price.toString()) });
            expect(await ico.balanceOf(await owner.getAddress())).to.equal(BigInt(amountWithDecimals));
        });
    });

    describe("DEX", () => {
        it("Should add first liquidity", async () => {
            let amountToken = "50";
            let amountETH = "0.5";
            let amountETHWithDecimals = parseFloat(amountETH) * Math.pow(10, 18);
            await ico.approve(dex.address, parseInt(amountToken));
            let liquidity = await dex.addLiquidity(amountToken, { value: ethers.utils.parseEther(amountETH) });
            expect(liquidity.value).to.equal(BigInt(amountETHWithDecimals));
        });

        it("Should add liquidity", async () => {
            let amountETH = "0.25";
            let amountETHWithDecimals = parseFloat(amountETH) * Math.pow(10, 18);
            let etherBalanceContract = await ethers.provider.getBalance(dex.address);
            let reservedToken = await dex.getReserve();
            let tokenAmount = await calculateNeededTokens(
                amountETH,
                etherBalanceContract,
                reservedToken
            );
            await ico.approve(dex.address, parseInt(tokenAmount));
            let liquidity = await dex.addLiquidity(tokenAmount, { value: ethers.utils.parseEther(amountETH) });
            expect(liquidity.value).to.equal(BigInt(amountETHWithDecimals));
        });

        it("Should add incorrect liquidity", async () => {
            let amountETH = "0.25";
            let reservedToken = await dex.getReserve();
            let tokenAmount = "10";
            await ico.approve(dex.address, parseInt(tokenAmount));
            await expect(dex.addLiquidity(tokenAmount, { value: ethers.utils.parseEther(amountETH) }))
            .to.be.rejectedWith("Incorrect ratio of tokens provided");
            expect(reservedToken).to.equal(BigNumber.from("75"));
        });

    });
});

const calculateNeededTokens = async (
    addEther = "0",
    etherBalanceContract: any,
    tokenReserve: any
) => {
    const addEtherAmountWei: any = ethers.utils.parseEther(addEther);
    const tokenAmount: any = (addEtherAmountWei * tokenReserve) / etherBalanceContract;
    return tokenAmount;
}