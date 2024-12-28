import AuthLinker from "@frontend/components/AuthLinker";
import DynamicHeightProvider from "@frontend/components/DynamicHeightProvider";
import CustomLocalizationProvider from "@frontend/components/LocalizationProvider";
import theme from "@frontend/utils/theme";
import { ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Metadata } from "next";
import { ReactNode, Suspense } from "react";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@frontend/globals.css";

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
              <AppRouterCacheProvider>
                <ThemeProvider theme={theme}>
                  <AuthLinker>
                    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                    <CssBaseline />
                    {children}
                  </AuthLinker>
                </ThemeProvider>
              </AppRouterCacheProvider>
            </CustomLocalizationProvider>
          </DynamicHeightProvider>
        </Suspense>
      </body>
    </html>
  );
}
