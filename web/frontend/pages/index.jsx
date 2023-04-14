import { useState } from "react";
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

// import { trophyImage } from "../assets";

import { ProductsCard } from "../components";

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const emptyToastProps = { content: null };
  const [isLoading, setIsLoading] = useState(false);
  const fetch = useAuthenticatedFetch();
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const { open } = useWeb3Modal()

  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

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
                  <p>
                    {isConnected?
                        <>
                          <p>Your wallet is connected to <b>{address}</b>!</p>
                        </>:"Please connect your wallet."}
                  </p>
                  {/* <p>
                    Your app is ready to explore! It contains everything you
                    need to get started including the{" "}
                    <Link url="https://polaris.shopify.com/" external>
                      Polaris design system
                    </Link>
                    ,{" "}
                    <Link url="https://shopify.dev/api/admin-graphql" external>
                      Shopify Admin API
                    </Link>
                    , and{" "}
                    <Link
                      url="https://shopify.dev/apps/tools/app-bridge"
                      external
                    >
                      App Bridge
                    </Link>{" "}
                    UI library and components.
                  </p>
                  <p>
                    Ready to go? Start populating your app with some sample
                    products to view and test in your store.{" "}
                  </p>
                  <p>
                    Learn more about building out your app in{" "}
                    <Link
                      url="https://shopify.dev/apps/getting-started/add-functionality"
                      external
                    >
                      this Shopify tutorial
                    </Link>{" "}
                    📚{" "}
                  </p> */}
                </TextContainer>
              </Stack.Item>
              {/* <Stack.Item>
                <div style={{ padding: "0 20px" }}>
                  <Image
                    source={trophyImage}
                    alt="Nice work on building a Shopify app"
                    width={120}
                  />
                </div>
              </Stack.Item> */}
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
