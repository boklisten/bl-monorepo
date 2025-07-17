import { ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Metadata } from "next";
import { ReactNode } from "react";

import AuthLinker from "@/components/AuthLinker";
import DynamicHeightProvider from "@/components/DynamicHeightProvider";
import CustomLocalizationProvider from "@/components/LocalizationProvider";
import ReactQueryClientProvider from "@/components/ReactQueryClientProvider";
import theme from "@/utils/theme";
import ToolpadProvider from "@/utils/ToolpadProvider";

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
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ReactQueryClientProvider>
              <DynamicHeightProvider>
                <CustomLocalizationProvider>
                  <ToolpadProvider>
                    <AuthLinker>{children}</AuthLinker>
                  </ToolpadProvider>
                </CustomLocalizationProvider>
              </DynamicHeightProvider>
            </ReactQueryClientProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
