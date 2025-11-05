import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import DispatchManager from "@/features/dispatches/DispatchManager";

export const metadata: Metadata = {
  title: "Utsendelser",
};

export default function DispatchPage() {
  return (
    <Container size={"xs"}>
      <Stack>
        <Title>Utsendelser</Title>
        <DispatchManager />
      </Stack>
    </Container>
  );
}
