import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import AuthLogoutComponent from "@/features/auth/AuthLogoutComponent";
import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import NextAnchor from "@/shared/components/NextAnchor";

export const metadata: Metadata = {
  title: "Tilgang avslått",
  description:
    "Du har ikke tilgang til å se dette innholdet. Du forsøke å logge inn med en annen bruker eller ta kontakt med administrator for spørsmål.",
};

export default function PermissionDeniedPage() {
  return (
    <Container size={"xs"}>
      <Stack>
        <Title>Tilgang avslått</Title>
        <ErrorAlert title={"Du har ikke tilgang til å se dette innholdet"}>
          Du forsøke å logge inn med en annen bruker eller ta kontakt med
          administrator for spørsmål.
        </ErrorAlert>
        <AuthLogoutComponent />
        <NextAnchor href={"/auth/login"}>
          Tilbake til innloggingssiden
        </NextAnchor>
      </Stack>
    </Container>
  );
}
