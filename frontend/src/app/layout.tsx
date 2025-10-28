import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";
import "mantine-react-table/styles.css";

import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import Head from "next/head";
import Script from "next/script";
import { Suspense } from "react";

import DayJsSetup from "@/features/layout/DayJsClientSetup";
import ReactQueryClientProvider from "@/features/layout/ReactQueryClientProvider";
import theme from "@/shared/utils/theme";

export default function RootLayout({ children }: LayoutProps<"/">) {
  // fixme: Remove top level Suspense and suspend further down the tree
  return (
    <html lang="no" {...mantineHtmlProps}>
      <Head key={"mantine"}>
        <ColorSchemeScript />
      </Head>
      <body>
        <Script src="https://checkout.vipps.no/checkout-button/v1/vipps-checkout-button.js" />
        <MantineProvider theme={theme}>
          <Notifications />
          <DatesProvider settings={{ locale: "nb" }}>
            <DayJsSetup />
            <Suspense>
              <ReactQueryClientProvider>
                <ModalsProvider>{children}</ModalsProvider>
              </ReactQueryClientProvider>
            </Suspense>
          </DatesProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
