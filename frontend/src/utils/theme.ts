"use client";
import { createTheme, responsiveFontSizes } from "@mui/material";
import { grey, orange, red } from "@mui/material/colors";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

/**
 * Create a theme instance.
 *
 * See typographyVariants.ts for TypeScript definitions for custom typography variants.
 */
const theme = responsiveFontSizes(
  createTheme({
    palette: {
      primary: {
        main: "#26768f",
      },
      secondary: {
        main: "#283d3b",
      },
      error: {
        main: red.A400,
      },
      warning: {
        main: orange["500"],
        light: orange["100"],
        dark: orange["700"],
        contrastText: grey["900"],
      },
    },
    typography: {
      fontFamily: roboto.style.fontFamily,
      h1: {
        fontSize: "2rem",
        marginTop: "1.6rem",
        marginBottom: "0.2rem",
      },
      h2: {
        fontSize: "1.5rem",
        marginTop: "1.6rem",
        fontWeight: 400,
        marginBottom: "0.2rem",
      },
      h3: {
        fontSize: "1.1rem",
        marginTop: "0.2rem",
        marginBottom: "0.2rem",
      },
    },
    components: {
      MuiNativeSelect: {
        styleOverrides: {
          select: {
            // '&' increases specificity
            "&": {
              padding: 1,
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          nativeInput: {
            "&": {
              padding: 1,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            paddingX: 5,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: "#26768f",
            "& .MuiIconButton-root": {
              color: "#FFFFFF",
            },
            "& .MuiTypography-root": {
              color: "#FFFFFF",
            },
          },
        },
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 450,
        md: 600,
        lg: 1000,
        xl: 1200,
      },
    },
  }),
);

export default theme;
