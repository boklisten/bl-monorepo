import { Container, Loader, Stack, Title } from "@mantine/core";
import { Metadata } from "next";
import { Suspense } from "react";

import AuthVerifier from "@/components/AuthVerifier";

export const metadata: Metadata = {
  title: "Logger inn...",
  description: "Du blir nå logget inn. Vennligst vent.",
};

export default function TokenPage() {
  return (
    <Container size={"xs"}>
      <Stack align={"center"}>
        <Title>Du blir nå logget inn...</Title>
        <Loader />
        <Suspense>
          <AuthVerifier />
        </Suspense>
      </Stack>
    </Container>
  );
}
