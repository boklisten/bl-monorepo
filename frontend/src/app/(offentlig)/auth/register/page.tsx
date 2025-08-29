import { Container, Divider, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import UserDetailsEditor from "@/components/user/user-detail-editor/UserDetailsEditor";
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
          <UserDetailsEditor variant={"signup"} />
        </Stack>
      </Container>
    </>
  );
};

export default RegisterPage;
