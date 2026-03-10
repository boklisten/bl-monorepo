import { Container, Stack, Text, Title } from "@mantine/core";
import ForgotPasswordForm from "@/features/auth/ForgotPasswordForm.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/auth/forgot")({
  head: () => ({
    meta: [
      { title: "Glemt passord | Boklisten.no" },
      {
        description: "Har du glemt passordet ditt? Få hjelp til å opprette et nytt!",
      },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  return (
    <Container size={"xs"}>
      <Stack>
        <Title ta={"center"} variant="h1">
          Glemt passord
        </Title>
        <Text ta={"center"}>
          Skriv inn din e-postadresse, så sender vi deg en lenke slik at du kan nullstille passordet
          ditt.
        </Text>
        <ForgotPasswordForm />
      </Stack>
    </Container>
  );
}
