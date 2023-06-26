import { Contract, providers, utils } from "ethers";
import { useEffect, useRef, useState } from "react";
import { Button } from "@chakra-ui/react";
import { NFT_CONTRACT_ADDRESS, NFT_ABI } from "../constants";
import { ethers } from "ethers";
import Image from 'next/image';
import nft from "../public/images/nft.jpg";

function Mint({chainId, library, account}: any) {
  const [loading, setLoading] = useState<boolean>(false);
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  const [contractBalance, setContractBalance] = useState("0");
  const [maxToken, setMaxToken] = useState("0");
  const [accountBalance, setAccountBalance] = useState("0");

  const mint = async () => {
      try {
          const provider = await getProviderOrSigner(chainId);
          const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
          const tx = await nftContract.mint({
              value: utils.parseEther("0.005"),
          });
          setLoading(true);
          await tx.wait();
          setLoading(false);
          window.alert("You successfully minted a Crypto Dev!");
      } catch (err) {
          console.error(err);
      }
  }

  const withdraw = async () => {
    try {
        const provider = await getProviderOrSigner(chainId);
        const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
        const tx = await nftContract.withdraw();
        setLoading(true);
        await tx.wait();
        setLoading(false);
        window.alert("You successfully withdraw a Crypto Dev!");
    } catch (err) {
        console.error(err);
    }
  }

  const getProviderOrSigner = async (needSigner = false) => {
      if (chainId !== 80001) {
        window.alert("Change the network to Mumbai");
        throw new Error("Change network to Mumbai");
      }
  
      if (needSigner) {
        const signer = library.getSigner();
        return signer;
      }
      return library;
  };

  useEffect(() => {
    const fetchBalance = async () => {
      const balanceContract = await library.getBalance(NFT_CONTRACT_ADDRESS);
      const ethValue = ethers.utils.formatEther(balanceContract);
      setContractBalance(ethValue);
    }
    const fetchTokenIdsMinted = async () => {
      const provider = await getProviderOrSigner(chainId);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
      const _tokenIds = await nftContract.totalSupply();
      setTokenIdsMinted(_tokenIds.toString());
    }
    const fetchMaxToken = async () => {
      const provider = await getProviderOrSigner(chainId);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
      const _maxToken = await nftContract.maxToken();
      setMaxToken(_maxToken.toString());
    }
    const fetchAccountBalance = async () => {
      const provider = await getProviderOrSigner(chainId);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
      const balance = await nftContract.balanceOf(account);
      console.log(account)
    }
    fetchBalance().catch(console.error);
    fetchTokenIdsMinted().catch(console.error);
    fetchMaxToken().catch(console.error);
    fetchAccountBalance().catch(console.error);
  });

  return (
    <div className="">
      <div className="pb-4">
          <div className="text-xl font-semibold pb-4">Join the adventure and mint your first Garden !</div>
          <div className="">
              <Image alt="NFT" src={nft} width={600} />
          </div>
      </div>
      <div className="flex pb-2">{contractBalance} Matic in the smart-contract balance</div>
      <div className="flex pb-2 items-center gap-4">
        <Button onClick={withdraw} colorScheme='orange'>Withdraw</Button>
        <Button id="loader" onClick={mint} colorScheme='teal'>Mint</Button>
        <div className="flex font-semibold">{ tokenIdsMinted } / { maxToken } have been minted</div>
      </div>
      <div className="italic">Your balance is { accountBalance } Gardens</div>
    </div>
  )
}

export {
  Mint
}