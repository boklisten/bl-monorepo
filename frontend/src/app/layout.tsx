import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Metadata } from "next";
import Head from "next/head";
import Script from "next/script";
import { Suspense } from "react";

import ClientProviders from "@/components/ClientProviders";
import muiTheme from "@/utils/muiTheme";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import "@/app/globals.css";
import "dayjs/locale/nb";

export const metadata: Metadata = {
  title: {
    template: "%s | Boklisten.no",
    default: "Boklisten.no",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // fixme: we probably should not have a Suspend here
  return (
    <html lang="no" {...mantineHtmlProps}>
      <Head key={"mantine"}>
        <ColorSchemeScript />
      </Head>
      <body>
        <Script src="https://checkout.vipps.no/checkout-button/v1/vipps-checkout-button.js" />
        <Suspense>
          <AppRouterCacheProvider>
            <ThemeProvider theme={muiTheme}>
              <ClientProviders>{children}</ClientProviders>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </Suspense>
      </body>
    </html>
  );
}
