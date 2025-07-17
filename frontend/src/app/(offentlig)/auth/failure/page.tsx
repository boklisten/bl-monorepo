import { Card, Container, Box, Typography } from "@mui/material";
import { Metadata } from "next";

import AuthFailureReasonAlert from "@/components/auth/AuthFailureReasonAlert";
import DynamicLink from "@/components/DynamicLink";

export const metadata: Metadata = {
  title: "Klarte ikke logge inn",
  description:
    "Vi klarte ikke å logge deg inn. Vennligst prøv på nytt eller ta kontakt hvis problemet vedvarer.",
};

export default function AuthFailurePage() {
  return (
    <Card sx={{ paddingBottom: 4 }}>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h1">Vi klarte ikke logge deg inn</Typography>
          <AuthFailureReasonAlert />
          <DynamicLink href={"/auth/login"}>
            Tilbake til innloggingssiden
          </DynamicLink>
        </Box>
      </Container>
    </Card>
  );
}
