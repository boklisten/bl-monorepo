import { Anchor, Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";
import Link from "next/link";

import AuthLogoutComponent from "@/components/AuthLogoutComponent";
import ErrorAlert from "@/components/ui/alerts/ErrorAlert";

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
        <Anchor component={Link} href={"/auth/login"}>
          Tilbake til innloggingssiden
        </Anchor>
      </Stack>
    </Container>
  );
}
