import { Card, CircularProgress, Container, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Metadata } from "next";

import AuthVerifier from "@/components/AuthVerifier";

export const metadata: Metadata = {
  title: "Logger inn...",
  description: "Du blir nå logget inn. Vennligst vent.",
};

export default function TokenPage() {
  return (
    <Card sx={{ paddingBottom: 4 }}>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h1">Du blir nå logget inn...</Typography>
          <CircularProgress />
          <AuthVerifier />
        </Box>
      </Container>
    </Card>
  );
}
