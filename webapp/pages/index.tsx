import { useEffect, useState } from "react";
import WalletConnect from '@walletconnect/web3-provider';
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { ethers } from "ethers";
import Web3Modal from 'web3modal';
import { Button, HStack, Text, Tooltip } from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import {Link} from 'react-router-dom';
import "dotenv/config";
import Head from "next/head";
import { Mint, Buy, Swap } from "../components";

const ALCHEMY_ID = process.env.ALCHEMY_ID || "";

const providerOptions = {
  walletconnect: {
    package: WalletConnect, // required
    options: {
      alchmeyId: ALCHEMY_ID, // required
    },
  },
  walletlink: {
    package: CoinbaseWalletSDK,
    options: {
      appName: "Web 3 Modal Demo",
      alchmeyId: ALCHEMY_ID, // required
    }
  },
}

const truncateAddress = (address: string) => {
  if (!address) return "No Account";
  const match = address.match(
    /^(0x[a-zA-Z0-9]{3})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/
  );
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
};

let web3Modal: Web3Modal;
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    cacheProvider: true, // optional
    providerOptions // required
  });
}

export default function Home() {
  const [provider, setProvider] = useState<any>();
  const [library, setLibrary] = useState<any>();
  const [account, setAccount] = useState<string>("");
  const [network, setNetwork] = useState<any>();
  const [chainId, setChainId] = useState<number>();
  const [error, setError] = useState<any>("");

  const connectWallet = async () => {
    try {
      const provider = await web3Modal.connect();
      const library = new ethers.providers.Web3Provider(provider);
      const accounts = await library.listAccounts();
      const network = await library.getNetwork();
      setProvider(provider);
      setLibrary(library);
      if (accounts) setAccount(accounts[0]);
      setChainId(network.chainId);
    } catch (error) {
      setError(error);
    }
  }

  const refreshState = () => {
    setAccount("");
    setNetwork("");
  }

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    refreshState();
  }

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts: String[]) => {
        console.log("accountsChanged", accounts);
        if (accounts) setAccount(account[0]);

        const handleChainChanged = (_hexChainId: number) => {
          setChainId(_hexChainId);
        }

        const handleDisconnect = () => {
          console.log("disconnect", error);
          disconnect();
        }

        provider.on("accountsChanged", handleAccountsChanged);
        provider.on("chainChanged", handleChainChanged);
        provider.on("disconnect", handleDisconnect);

        return () => {
          if (provider.removeListener) {
            provider.removeListener("accountsChanged", handleAccountsChanged);
            provider.removeListener("chainChanged", handleChainChanged);
            provider.removeListener("disconnect", handleDisconnect);
          }
        }
      }
    }
  }, [provider]);

  return (
    <div className="container mx-auto">
      <Head>
        <title>GardenSwap</title>
      </Head>
      <div className="flex p-6 px-10">
        <div className="flex items-center w-1/2">
          <span className="font-bold text-2xl">👨‍🌾 GardenSwap</span>
        </div>
        <div className="flex justify-end w-1/2 gap-4">
          <HStack>
            {!account ? (
              <Button onClick={connectWallet} colorScheme='teal'>Connect Wallet</Button>
            ) : (
              <Button onClick={disconnect} colorScheme='teal'>Disconnect</Button>
            )}
          </HStack>
          <div className="flex">
            <div>
              <HStack>
                <Text>{`Connection Status: `}</Text>
                {account ? (
                  <CheckCircleIcon color="green" />
                ) : (
                  <WarningIcon color="orange" />
                )}
              </HStack>
              <Tooltip label={account} placement="right">
                <Text>{`Account: ${truncateAddress(account)}`}</Text>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between p-10 gap-10">          
        <div className="w-1/2">
          <Mint chainId={chainId} library={library} />
        </div>
        <div className="w-1/2">
          <Buy chainId={chainId} library={library} />
          <Swap chainId={chainId} library={library} />
        </div>
      </div>
    </div>
  )
}