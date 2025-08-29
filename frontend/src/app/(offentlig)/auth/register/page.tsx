import { Container } from "@mantine/core";
import { Metadata } from "next";

import PersonalUserDetailEditor from "@/components/user/user-detail-editor/PersonalUserDetailEditor";

export const metadata: Metadata = {
  title: "Ny bruker",
  description: "Opprett en ny bruker for å tilgang til å bestille skolebøker.",
};

const RegisterPage = () => {
  return (
    <>
      <Container size={"xs"}>
        <PersonalUserDetailEditor isSignUp />
      </Container>
    </>
  );
};

export default RegisterPage;
