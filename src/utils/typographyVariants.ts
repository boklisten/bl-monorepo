/**
 * This file extends the TS definitions for MUI typography to our new variants.
 * @see theme
 */

declare module "@mui/material/styles" {
  import { CSSProperties } from "react";

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
