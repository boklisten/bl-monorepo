import { Container, Box, Grid2 } from "@mui/material";
import { ReactNode } from "react";

import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";

export default function PublicPageLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Grid2
        container
        sx={{
          minHeight: "100vh",
          flexDirection: "column",
        }}
      >
        <NavBar />
        <Container
          sx={{
            display: "flex",
            flexGrow: 1,
            alignItems: "stretch",
            paddingX: 0,
          }}
        >
          <Box sx={{ width: "100%" }}>{children}</Box>
        </Container>
      </Grid2>
      <Footer />
    </>
  );
}
