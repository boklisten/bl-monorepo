import Footer from "@frontend/components/Footer";
import NavBar from "@frontend/components/NavBar";
import { Container, Box, Grid2 } from "@mui/material";
import { ReactNode } from "react";

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
