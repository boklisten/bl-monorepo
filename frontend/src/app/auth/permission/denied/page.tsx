import AuthAutoLogout from "@frontend/components/AuthLogoutComponent";
import DynamicLink from "@frontend/components/DynamicLink";
import { Alert, AlertTitle, Card, Container } from "@mui/material";
import { Box } from "@mui/system";
import { Metadata } from "next";

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
          <DynamicLink href={"/auth/login"}>
            Tilbake til innloggingssiden
          </DynamicLink>
          <AuthAutoLogout />
        </Box>
      </Container>
    </Card>
  );
}
