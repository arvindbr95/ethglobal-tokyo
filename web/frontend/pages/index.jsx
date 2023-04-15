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
  Spinner,
  RadioButton
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
  const [isAirstackLoading, setIsAirStackLoading] = useState(false);
  const fetch = useAuthenticatedFetch();
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const { open } = useWeb3Modal()
  const [nfts, setNfts] = useState(null)
  const [selectedNft, setSelectedNft] = useState(0)
  // console.log("nfts", nfts)

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
      fetchNFTs();
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
    setIsAirStackLoading(true)
    console.log("fetching NFTs")
    const query = gql`
        query MyQuery {
          TokenBalances(
            input: {
              filter: {
                tokenAddress: { _eq: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"}
                owner: { _eq: "0xC98C4680b7D97669d4D7F4D634a63668A2d48A84" }
                tokenType: { _in: [ERC1155, ERC721] }
              }
              blockchain: ethereum
              limit: 10
            }
          ) {
            TokenBalance {
              tokenAddress
              tokenId
              amount
              tokenType
              tokenNfts {
                contentValue {
                  image {
                    small
                  }
                }
                metaData {
                  attributes {
                    trait_type
                    value
                  }
                  image
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
    setIsAirStackLoading(false)
    console.log("response", response);
    setNfts(response.data.TokenBalances.TokenBalance)
    // console.log("nfts", response.data.TokenBalances);
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
                  <p style={{marginBottom:16}}>
                    {
                      !isConnected?
                      "Please connect your wallet to view detected apes.":"NFTs:"
                    }
                  </p>
                  
                    {
                      isConnected?isAirstackLoading?<Spinner size="small"/>:<Stack>
                        {
                          nfts?.map((nft, index) => {
                            // console.log('nft', nft);
                            return(<Stack.Item key={index}>
                              <Image style={{marginBottom: 8}} height={150} src={nft.tokenNfts.contentValue.image.small}></Image>
                              <p>Token ID: #{nft.tokenId}</p>
                              <RadioButton label="Select" />
                            </Stack.Item>)
                          })
                        }
                      </Stack>:<></>
                    }
                  
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
