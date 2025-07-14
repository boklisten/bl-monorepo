import { Alert, AlertTitle, Box, Card, Container } from "@mui/material";
import { Metadata } from "next";

import AuthLogoutComponent from "@/components/AuthLogoutComponent";
import DynamicLink from "@/components/DynamicLink";

export const metadata: Metadata = {
  title: "Tilgang avslått",
  description:
    "Du har ikke tilgang til å se dette innholdet. Du forsøke å logge inn med en annen bruker eller ta kontakt med administrator for spørsmål.",
};

export default function PermissionDeniedPage() {
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
          <Alert severity={"error"} sx={{ my: 2 }}>
            <AlertTitle>
              Du har ikke tilgang til å se dette innholdet
            </AlertTitle>
            Du forsøke å logge inn med en annen bruker eller ta kontakt med
            administrator for spørsmål.
          </Alert>
          <AuthLogoutComponent />
          <DynamicLink href={"/auth/login"}>
            Tilbake til innloggingssiden
          </DynamicLink>
        </Box>
      </Container>
    </Card>
  );
}
