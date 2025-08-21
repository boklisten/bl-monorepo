import { Box, Card, Container } from "@mui/material";
import { Metadata } from "next";

import EmailConfirmer from "@/components/EmailConfirmer";

export const metadata: Metadata = {
  title: "Bekreft e-post",
  description:
    "Bekreft din e-postadresse, slik at du får viktig informasjon fra oss.",
};

export default async function TokenPage({
  params,
}: PageProps<"/auth/email/confirm/[confirmationId]">) {
  const { confirmationId } = await params;
  return (
    <Card sx={{ paddingBottom: 4 }}>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <EmailConfirmer confirmationId={confirmationId} />
        </Box>
      </Container>
    </Card>
  );
}
