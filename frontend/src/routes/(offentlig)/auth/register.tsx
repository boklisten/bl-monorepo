import { Container, Divider, Stack, Title } from "@mantine/core";

import VippsButton from "@/features/auth/VippsButton.tsx";
import SignupForm from "@/features/user/SignupForm.tsx";
import TanStackAnchor from "@/shared/components/TanStackAnchor.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/auth/register")({
  head: () => ({
    meta: [
      { title: "Ny bruker | Boklisten.no" },
      {
        description: "Opprett en ny bruker for å tilgang til å bestille skolebøker.",
      },
    ],
  }),
  validateSearch: (search): { redirect?: string; caller?: string } => ({
    redirect: (search["redirect"] as string) || "",
    caller: (search["caller"] as string) || "",
  }),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <>
      <Container size={"xs"}>
        <Stack>
          <Title ta={"center"}>Registrer deg</Title>
          <VippsButton verb={"register"} />
          <Divider label={"Eller, registrer deg med e-post"} />
          <SignupForm />
          <TanStackAnchor size={"sm"} to={"/auth/login"}>
            Har du allerede en konto? Logg inn
          </TanStackAnchor>
        </Stack>
      </Container>
    </>
  );
}
