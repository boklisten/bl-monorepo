import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import ClientPage from "@/app/(administrasjon)/admin/hurtigutdeling/ClientPage";

export const metadata: Metadata = {
  title: "Hurtigutdeling",
};

export default function RapidHandoutPage() {
  return (
    <Container>
      <Stack>
        <Title>Hurtigutdeling</Title>
        <ClientPage />
      </Stack>
    </Container>
  );
}
