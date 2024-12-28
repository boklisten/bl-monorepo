import Footer from "@frontend/components/Footer";
import NavBar from "@frontend/components/NavBar";
import { Container, Box } from "@mui/material";
import { ReactNode } from "react";

export default function PublicPageLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#f9f9f9",
          display: "flex",
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
      </Box>
      <Box
        sx={{
          height: 2,
          width: "100%",
        }}
      />
      <Footer />
    </>
  );
}
