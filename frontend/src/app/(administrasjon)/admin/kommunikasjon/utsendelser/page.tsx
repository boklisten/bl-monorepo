import { Container, Stack, Text, Title } from "@mantine/core";
import { Metadata } from "next";

import DispatchManager from "@/features/dispatches/DispatchManager";

export const metadata: Metadata = {
  title: "Utsendelser",
};

export default function DispatchPage() {
  return (
    <Container size={"sm"}>
      <Stack>
        <Stack gap={2}>
          <Title>Utsendelser</Title>
          <Text size={"sm"} c={"dimmed"}>
            Send SMS og/eller e-post til en liste med mottakere
          </Text>
        </Stack>
        <DispatchManager />
      </Stack>
    </Container>
  );
}
