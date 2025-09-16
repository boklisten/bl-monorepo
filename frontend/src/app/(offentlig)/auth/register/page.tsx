import { Anchor, Container, Divider, Stack, Title } from "@mantine/core";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import VippsButton from "@/features/auth/VippsButton";
import SignupForm from "@/features/user/SignupForm";

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
          <Anchor size={"sm"} component={Link} href={"/auth/login"}>
            Har du allerede en konto? Logg inn
          </Anchor>
        </Stack>
      </Container>
    </>
  );
};

export default RegisterPage;
