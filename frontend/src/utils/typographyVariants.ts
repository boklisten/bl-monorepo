/**
 * This file extends the TS definitions for MUI typography to our new variants.
 * @see theme
 */
// eslint-disable-next-line import-x/no-unused-modules
import { CSSProperties } from "react";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    cardHeader: CSSProperties;
    title: CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    cardHeader?: CSSProperties;
    title?: CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    cardHeader: true;
    title: true;
  }
}
