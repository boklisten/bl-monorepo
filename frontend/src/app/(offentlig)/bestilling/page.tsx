import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import SelectOrderBranch from "@/features/order/SelectOrderBranch";

export const metadata: Metadata = {
  title: "Bestill bøker",
  description:
    "Velg hvilken skole og hvilke fag du tar, så finner vi bøkene du trenger for deg!",
};

export default function OrderPage() {
  return (
    <Container size={"md"}>
      <Stack gap={"xs"}>
        <Title>Hvor går du på skole?</Title>
        <SelectOrderBranch />
      </Stack>
    </Container>
  );
}
