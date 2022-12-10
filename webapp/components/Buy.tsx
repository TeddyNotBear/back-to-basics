import { Contract, providers, utils } from "ethers";
import { useEffect, useRef, useState } from "react";
import { Button, Input, Text } from "@chakra-ui/react";
import nft from "../public/images/nft.jpg";

function Buy({chainId, library}: any) {
    const [loading, setLoading] = useState<boolean>(false);
    const [value, setValue] = useState<number>(0)
    const handleChange = (event: any) => setValue(event.target.value);

    /*const mint = async () => {
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
    }*/

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
        <div className="pb-10">
            <div className="text-xl font-semibold pb-4">Participate to our ICO</div>
            <div>Free claimable Garden Tokens for Gardens holders !!</div>
        </div>
        <div className="pb-4">
            <div className="mb-3">
                <div className="flex justify-between">
                    <Text mb='8px'>Quantity of tokens you want to buy :</Text>
                    <div className="italic">? / ? Garden Tokens have been purchased</div>
                </div>
                <Input
                    value={value}
                    onChange={handleChange}
                    size='sm'
                />
            </div>
            <div className="flex items-center justify-between">
                <Button colorScheme='teal'>Buy</Button>
                <div className="italic">Your balance is <span>X</span> Garden Tokens</div>
            </div>
        </div>
      </>
    )
}

export {
    Buy
}