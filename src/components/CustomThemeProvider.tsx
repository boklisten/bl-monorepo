"use client";
import { ThemeProvider } from "@mui/material";
import { ReactNode } from "react";

import theme from "@/utils/theme";

export default function CustomThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
