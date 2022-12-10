import { Contract, providers, utils } from "ethers";
import { useEffect, useRef, useState } from "react";
import { Button } from "@chakra-ui/react";
import { NFT_CONTRACT_ADDRESS, NFT_ABI } from "../constants";
import Image from 'next/image';
import nft from "../public/images/nft.jpg";

function Mint({chainId, library}: any) {
    const [loading, setLoading] = useState<boolean>(false);
    const [tokenIdsMinted, setTokenIdsMinted] = useState("0");

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

    const getTokenIdsMinted = async () => {
        try {
          const provider = await getProviderOrSigner(chainId);
          const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
          const _tokenIds = await nftContract.tokenIds();
          setTokenIdsMinted(_tokenIds.toString());
        } catch (err) {
          console.error(err);
        }
      };

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

    return (
      <>
        <div className="pb-4">
            <div className="text-xl font-semibold pb-10">Join the adventure and mint your first Garden !</div>
            <div className="">
                <Image alt="NFT" src={nft} width={550} />
            </div>
        </div>
        <div className="flex pb-4 items-center">
          <Button onClick={mint} colorScheme='teal'>Mint</Button>
          <div className="flex justify-end">? / ? have been minted</div>
        </div>
        <div className="italic">Your balance is <span>X</span> Gardens</div>
      </>
    )
}

export {
    Mint
}