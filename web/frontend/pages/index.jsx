import { useState, useEffect } from "react";
import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { Toast } from "@shopify/app-bridge-react";
import { useAuthenticatedFetch } from "../hooks";
import { Web3Button, useWeb3Modal } from '@web3modal/react'
import { useAccount } from 'wagmi'
import { ApolloClient, InMemoryCache, gql } from "@apollo/client/core"

// import { trophyImage } from "../assets";

import { ProductsCard } from "../components";

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const emptyToastProps = { content: null };
  const [isLoading, setIsLoading] = useState(false);
  const fetch = useAuthenticatedFetch();
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const { open } = useWeb3Modal()


  // Initializing apollo Client 🚀
  const client = new ApolloClient({
      uri: "https://api.airstack.xyz/gql",
      cache: new InMemoryCache(),
      headers: { Authorization: "bb3c3769a010477caa281aaea6d64a8a" },
  })
  
  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  useEffect(() => {
    if (isConnected) {
      // fetchNFTs();
    }
  }, [isConnected])

  // console.log("address is ",address);

  const handleUpdateTheme = async () => {
    setIsLoading(true);
    const response = await fetch("/api/update/theme");
  
    if (response.ok) {
      // await refetchProductCount();
      console.log("response", response);
      setToastProps({ content: "Theme updated!" });
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setToastProps({
        content: "There was an error updating theme",
        error: true,
      });
    }
  };

  const fetchNFTs = async () => {
    console.log("fetching NFTs")
    const query = gql`
        query MyQuery {
          TokenBalances(
            input: {
              filter: {
                tokenAddress: { _eq: "0xe8a858b29311652f7e2170118fbead34d097e88a"}
                owner: { _eq: $address }
                tokenType: { _in: [ERC1155, ERC721] }
              }
              blockchain: polygon
              limit: 10
            }
          ) {
            TokenBalance {
              tokenAddress
              amount
              tokenType
              tokenNfts {
                metaData {
                  name
                }
              }
              owner {
                addresses
              }
            }
          }
        }
      `
    const response = await client.query({
      query,
      variables: {
          address: address,
      },
    })
    console.log("response", response);
  }
  
  return (
    <Page narrowWidth>
      <TitleBar title="Apeify Dashboard" primaryAction={null} />
      <Layout>
        <Layout.Section>
          {toastMarkup}
          <Card 
            title="Connect Wallet 💰"
            sectioned
            primaryFooterAction={{
              content: "Connect Wallet",
              onAction: open,
              disabled: isConnected
            }}
          >
            <Stack
              wrap={false}
              spacing="extraTight"
              distribution="trailing"
              alignment="center"
            >
              <Stack.Item fill>
                <TextContainer spacing="loose">
                    {isConnected?
                        <>
                          <p>Connected to wallet <b>{address}</b>!</p>
                        </>:<p>Please connect your wallet.</p>
                      }
                </TextContainer>
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card 
              title="Detected NFTs 🖼️"
              sectioned
            >
            <Stack
              wrap={false}
              spacing="extraTight"
              distribution="trailing"
              alignment="center"
            >
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <p>
                    {
                      !isConnected?
                      "Please connect your wallet to view detected apes.":"NFTs:"
                    }
                  </p>
                  </TextContainer>
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card 
              title="Update Store Theme 🎨"
              sectioned
              primaryFooterAction={{
                content: "Update Theme",
                onAction: handleUpdateTheme,
                loading: isLoading,
                disabled: !isConnected
              }}
            >
            <Stack
              wrap={false}
              spacing="extraTight"
              distribution="trailing"
              alignment="center"
            >
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <p>
                    Click the button below to update your theme.
                  </p>
                  </TextContainer>
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
