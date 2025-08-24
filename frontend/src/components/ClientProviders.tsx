"use client";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { ReactNode } from "react";

import theme from "@/app/theme";
import AuthLinker from "@/components/AuthLinker";
import CustomLocalizationProvider from "@/components/LocalizationProvider";
import ReactQueryClientProvider from "@/components/ReactQueryClientProvider";
import ToolpadProvider from "@/utils/ToolpadProvider";

dayjs.extend(customParseFormat);
dayjs.locale("nb");

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ReactQueryClientProvider>
      <CustomLocalizationProvider>
        <ToolpadProvider>
          <DatesProvider settings={{ locale: "nb" }}>
            <AuthLinker>
              <MantineProvider theme={theme}>{children}</MantineProvider>
            </AuthLinker>
          </DatesProvider>
        </ToolpadProvider>
      </CustomLocalizationProvider>
    </ReactQueryClientProvider>
  );
}
