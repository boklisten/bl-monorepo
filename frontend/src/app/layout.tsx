import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";
import "mantine-react-table/styles.css";
import "dayjs/locale/nb";

import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import Head from "next/head";
import Script from "next/script";
import { Suspense } from "react";

import ClientProviders from "@/components/ClientProviders";

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
          <ClientProviders>{children}</ClientProviders>
        </Suspense>
      </body>
    </html>
  );
}
