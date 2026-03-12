import { createFileRoute } from "@tanstack/react-router";
import { Container, Stack, Title } from "@mantine/core";
import AuthLogoutComponent from "@/features/auth/AuthLogoutComponent.tsx";
import ErrorAlert from "@/shared/components/alerts/ErrorAlert.tsx";
import TanStackAnchor from "@/shared/components/TanStackAnchor.tsx";

export const Route = createFileRoute("/(offentlig)/auth/permission/denied")({
  head: () => ({
    meta: [
      { title: "Tilgang avslått | Boklisten.no" },
      {
        description:
          "Du har ikke tilgang til å se dette innholdet. Du forsøke å logge inn med en annen bruker eller ta kontakt med administrator for spørsmål.",
      },
    ],
  }),
  component: PermissionDeniedPage,
});

function PermissionDeniedPage() {
  return (
    <Container size={"xs"}>
      <Stack>
        <Title>Tilgang avslått</Title>
        <ErrorAlert title={"Du har ikke tilgang til å se dette innholdet"}>
          Du forsøke å logge inn med en annen bruker eller ta kontakt med administrator for
          spørsmål.
        </ErrorAlert>
        <AuthLogoutComponent />
        <TanStackAnchor to={"/auth/login"}>Tilbake til innloggingssiden</TanStackAnchor>
      </Stack>
    </Container>
  );
}
