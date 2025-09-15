import { Anchor, Container, Divider, Stack, Title } from "@mantine/core";
import { Metadata } from "next";
import Link from "next/link";

import SignupForm from "@/components/user/SignupForm";
import VippsButton from "@/components/user/VippsButton";

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
          <VippsButton verb={"register"} />
          <Divider label={"Eller, registrer deg med e-post"} />
          <SignupForm />
          <Anchor size={"sm"} component={Link} href={"/auth/login"}>
            Har du allerede en konto? Logg inn
          </Anchor>
        </Stack>
      </Container>
    </>
  );
};

export default RegisterPage;
