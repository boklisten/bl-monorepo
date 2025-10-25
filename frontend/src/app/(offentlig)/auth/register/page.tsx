import { Container, Divider, Stack, Title } from "@mantine/core";
import { Metadata } from "next";
import { Suspense } from "react";

import VippsButton from "@/features/auth/VippsButton";
import SignupForm from "@/features/user/SignupForm";
import NextAnchor from "@/shared/components/NextAnchor";

export const metadata: Metadata = {
  title: "Ny bruker",
  description: "Opprett en ny bruker for å tilgang til å bestille skolebøker.",
};

const RegisterPage = () => {
  return (
    <>
      <Container size={"xs"}>
        <Stack>
          <Title ta={"center"}>Registrer deg</Title>
          <Suspense>
            <VippsButton verb={"register"} />
          </Suspense>
          <Divider label={"Eller, registrer deg med e-post"} />
          <Suspense>
            <SignupForm />
          </Suspense>
          <NextAnchor size={"sm"} href={"/auth/login"}>
            Har du allerede en konto? Logg inn
          </NextAnchor>
        </Stack>
      </Container>
    </>
  );
};

export default RegisterPage;
