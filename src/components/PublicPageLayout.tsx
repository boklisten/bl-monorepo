import { Container } from "@mui/material";
import { Box } from "@mui/system";
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
