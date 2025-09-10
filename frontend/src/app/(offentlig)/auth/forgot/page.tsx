import { Container, Stack, Text, Title } from "@mantine/core";
import { Metadata } from "next";

import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Glemt passord",
  description: "Har du glemt passordet ditt? Få hjelp til å opprette et nytt!",
};

const ForgotPage = () => {
  return (
    <Container size={"xs"}>
      <Stack>
        <Title ta={"center"} variant="h1">
          Glemt passord
        </Title>
        <Text ta={"center"}>
          Skriv inn din e-postadresse, så sender vi deg en lenke slik at du kan
          nullstille passordet ditt.
        </Text>
        <ForgotPasswordForm />
      </Stack>
    </Container>
  );
};

export default ForgotPage;
