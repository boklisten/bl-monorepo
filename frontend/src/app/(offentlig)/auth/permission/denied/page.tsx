import { Alert, AlertTitle, Box, Card, Container } from "@mui/material";
import { Metadata } from "next";
import { useEffect } from "react";

import DynamicLink from "@/components/DynamicLink";
import useAuth from "@/utils/useAuth";

export const metadata: Metadata = {
  title: "Tilgang avslått",
  description:
    "Du har ikke tilgang til å se dette innholdet. Du forsøke å logge inn med en annen bruker eller ta kontakt med administrator for spørsmål.",
};

export default function PermissionDeniedPage() {
  const { logout } = useAuth();
  useEffect(() => {
    logout();
  }, [logout]);

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
        </Box>
      </Container>
    </Card>
  );
}
