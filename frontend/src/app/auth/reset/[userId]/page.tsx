import PasswordReset from "@frontend/components/user/PasswordReset";
import { Card, Container, Typography, Box } from "@mui/material";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lag nytt passord",
  description: "Lag et nytt passord, slik at du får tilgang på kontoen din.",
};

export default async function PasswordResetPage(props: {
  params: Promise<{ userId: string }>;
}) {
  const params = await props.params;
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
          <Typography variant="h1">Lag nytt passord</Typography>
          <PasswordReset userId={params.userId} />
        </Box>
      </Container>
    </Card>
  );
}
