import { BrowserRouter } from "react-router-dom";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from "./components";

import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { polygonMumbai } from 'wagmi/chains'

const chains = [polygonMumbai]
const projectId = '54bc015963fddedceebf015ebdf0f579'

const { provider } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiClient = createClient({
  autoConnect: false,
  connectors: w3mConnectors({ projectId, version: 1, chains}),
  provider,
})
const ethereumClient = new EthereumClient(wagmiClient, chains)


export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");

  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <PolarisProvider>
          <BrowserRouter>
            <AppBridgeProvider>
              <QueryProvider>
                <NavigationMenu
                  navigationLinks={[
                    {
                      label: "Page name",
                      destination: "/pagename",
                    },
                  ]}
                />
                <Routes pages={pages} />
              </QueryProvider>
            </AppBridgeProvider>
          </BrowserRouter>
        </PolarisProvider>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} themeMode={'light'} />
    </>
  );
}
