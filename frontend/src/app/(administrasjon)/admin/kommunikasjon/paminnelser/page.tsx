import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import Reminders from "@/features/reminders/Reminders";

export const metadata: Metadata = {
  title: "Påminnelser",
};

export default function RemindersPage() {
  return (
    <Container size={"xs"}>
      <Stack>
        <Title>Påminnelser</Title>
        <Reminders />
      </Stack>
    </Container>
  );
}
