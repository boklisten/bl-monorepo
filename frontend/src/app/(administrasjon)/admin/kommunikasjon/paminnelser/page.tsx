import { Container, Stack, Title, Text } from "@mantine/core";
import { Metadata } from "next";

import Reminders from "@/features/reminders/Reminders";

export const metadata: Metadata = {
  title: "Påminnelser",
};

export default function RemindersPage() {
  return (
    <Container size={"xs"}>
      <Stack>
        <Stack gap={2}>
          <Title>Påminnelser</Title>
          <Text size={"sm"} c={"dimmed"}>
            Send SMS eller e-post til elever med aktive bøker på valgte filialer
          </Text>
        </Stack>
        <Reminders />
      </Stack>
    </Container>
  );
}
