import CssBaseline from "@mui/material/CssBaseline";
import { Metadata } from "next";
import { ReactNode, Suspense } from "react";

import AuthLinker from "@/components/AuthLinker";
import CustomThemeProvider from "@/components/CustomThemeProvider";
import DynamicHeightProvider from "@/components/DynamicHeightProvider";
import CustomLocalizationProvider from "@/components/LocalizationProvider";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@/globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Boklisten.no",
    default: "Boklisten.no",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="no">
      <body>
        <Suspense>
          <DynamicHeightProvider>
            <CustomLocalizationProvider>
              <CustomThemeProvider>
                <AuthLinker>
                  {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                  <CssBaseline />
                  {children}
                </AuthLinker>
              </CustomThemeProvider>
            </CustomLocalizationProvider>
          </DynamicHeightProvider>
        </Suspense>
      </body>
    </html>
  );
}
