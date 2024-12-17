"use client";
import theme from "@frontend/utils/theme";
import { ThemeProvider } from "@mui/material";
import { ReactNode } from "react";

export default function CustomThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
