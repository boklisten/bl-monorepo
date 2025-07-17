import { Box, Card, Container, Typography } from "@mui/material";
import { Metadata } from "next";

import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Glemt passord",
  description: "Har du glemt passordet ditt? Få hjelp til å opprette et nytt!",
};

const ForgotPage = () => {
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
          <Typography variant="h1">Glemt passord</Typography>
          <Typography sx={{ mt: 1 }}>
            Skriv inn din e-postadresse, så sender vi deg en lenke slik at du
            kan nullstille passordet ditt.
          </Typography>
          <ForgotPasswordForm />
        </Box>
      </Container>
    </Card>
  );
};

export default ForgotPage;
