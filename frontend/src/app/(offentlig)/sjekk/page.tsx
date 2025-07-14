import { Card, Container, Stack, Typography, Box } from "@mui/material";
import { Metadata } from "next";

import AuthGuard from "@/components/common/AuthGuard";
import PublicBlidSearch from "@/components/search/PublicBlidSearch";

export const metadata: Metadata = {
  title: "Boksøk",
  description: "Sjekk hvem bøker utdelt fra Boklisten tilhører",
};

export default function PublicBlidSearchPage() {
  return (
    <Card sx={{ paddingBottom: 4 }}>
      <Container component="main" maxWidth="xs">
        <Stack
          sx={{
            alignItems: "center",
            mt: 4,
          }}
        >
          <Typography variant="h1">Boksøk</Typography>
          <Box
            sx={{
              width: "100%",
            }}
          >
            <AuthGuard>
              <PublicBlidSearch />
            </AuthGuard>
          </Box>
        </Stack>
      </Container>
    </Card>
  );
}
