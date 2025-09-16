import { Center, Container, Divider, Stack, Title } from "@mantine/core";
import { Metadata } from "next";
import { Suspense } from "react";

import LocalSignIn from "@/components/user/LocalSignIn";
import VippsButton from "@/components/user/VippsButton";

export const metadata: Metadata = {
  title: "Logg inn",
  description:
    "Logg inn for bestille bøker, samt se status på nåvårende bøker.",
};

const LoginPage = () => {
  return (
    <Container size={"xs"}>
      <Stack>
        <Title ta={"center"}>Logg inn</Title>
        <Center>
          <Suspense>
            <VippsButton verb={"login"} />
          </Suspense>
        </Center>
        <Divider w={"100%"} label={"eller"}></Divider>
        <Suspense>
          <LocalSignIn />
        </Suspense>
      </Stack>
    </Container>
  );
};

export default LoginPage;
