import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import AdminCart from "@/features/rapid-handout/AdminCart";

export const metadata: Metadata = {
  title: "Hurtigutdeling",
};

export default function RapidHandoutPage() {
  return (
    <Container>
      <Stack>
        <Title>Hurtigutdeling</Title>
        <AdminCart />
      </Stack>
    </Container>
  );
}
