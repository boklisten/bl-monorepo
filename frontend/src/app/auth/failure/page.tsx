import DynamicLink from "@frontend/components/DynamicLink";
import { Alert, AlertTitle, Card, Container } from "@mui/material";
import { Box } from "@mui/system";
import { Metadata } from "next";

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
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Alert severity={"error"} sx={{ my: 2 }}>
            <AlertTitle>Vi klarte ikke å logge deg inn</AlertTitle>
            Vennligst prøv på nytt eller ta kontakt hvis problemet vedvarer.
          </Alert>
          <DynamicLink href={"/auth/login"}>
            Tilbake til innloggingssiden
          </DynamicLink>
        </Box>
      </Container>
    </Card>
  );
}
