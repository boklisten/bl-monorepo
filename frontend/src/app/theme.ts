import { createTheme } from "@mantine/core";

// Run "pnpm --filter frontend theme" to apply changes to the generated css file
const theme = createTheme({
  breakpoints: {
    xs: "36em",
    sm: "48em",
    md: "62em",
    lg: "75em",
    xl: "88em",
  },
  colors: {
    brand: [
      "#eff8fb",
      "#e0edf1",
      "#bbdae4",
      "#94c7d8",
      "#75b7cd",
      "#62adc6",
      "#56a8c4",
      "#4693ad",
      "#3a829b",
      "#26768f",
    ],
  },
  primaryColor: "brand",
  primaryShade: 9,
});

export default theme;
