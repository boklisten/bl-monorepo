import { Center, Container, Divider, Stack, Title } from "@mantine/core";

import LocalSignIn from "@/features/auth/LocalSignIn.tsx";
import VippsButton from "@/features/auth/VippsButton.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/auth/login")({
  head: () => ({
    meta: [
      { title: "Logg inn | Boklisten.no" },
      {
        description: "Logg inn for bestille bøker, samt se status på nåvårende bøker.",
      },
    ],
  }),
  validateSearch: (search): { redirect?: string; caller?: string } => ({
    redirect: (search["redirect"] as string) || "",
    caller: (search["caller"] as string) || "",
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <Container size={"xs"}>
      <Stack>
        <Title ta={"center"}>Logg inn</Title>
        <Center>
          <VippsButton verb={"login"} />
        </Center>
        <Divider w={"100%"} label={"eller"}></Divider>
        <LocalSignIn />
      </Stack>
    </Container>
  );
}
