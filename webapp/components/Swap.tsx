import { Contract, providers, utils } from "ethers";
import { useEffect, useRef, useState } from "react";
import { Button, Card, CardBody, Input, Stack, Text } from "@chakra-ui/react";
import { NFT_CONTRACT_ADDRESS, NFT_ABI } from "../constants";

function Swap({chainId, library}: any) {
    const [loading, setLoading] = useState<boolean>(false);

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
      <div className="">
        <Card variant="outline">
            <CardBody>
                <Stack spacing={4}>
                    <Text className="">Swap</Text>
                    <div>
                        <Input size='md' />
                    </div>
                    <div>
                        <Input size='md' />
                    </div>
                    <Button colorScheme='teal'>Approve</Button>
                </Stack>
            </CardBody>
        </Card>
      </div>
    )
}

export {
    Swap
}