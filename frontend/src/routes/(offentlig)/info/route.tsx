import { Container, Stack } from "@mantine/core";

import InfoPagesNavigation from "@/features/info/InfoPagesNavigation";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/info")({
  component: InfoPageLayout,
});

function InfoPageLayout() {
  return (
    <Container>
      <Stack>
        <InfoPagesNavigation />
        <Outlet />
      </Stack>
    </Container>
  );
}
