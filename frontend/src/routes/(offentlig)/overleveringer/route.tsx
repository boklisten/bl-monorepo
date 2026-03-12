import { Container, Stack } from "@mantine/core";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/overleveringer")({
  component: MatchPagesLayout,
});

function MatchPagesLayout() {
  return (
    <Container>
      <Stack>
        <Outlet />
      </Stack>
    </Container>
  );
}
