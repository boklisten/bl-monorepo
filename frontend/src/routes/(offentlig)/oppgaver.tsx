import { Container, Stack, Title } from "@mantine/core";

import Tasks from "@/features/Tasks";
import AuthGuard from "@/features/auth/AuthGuard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/oppgaver")({
  head: () => ({
    meta: [{ title: "Dine oppgaver | Boklisten.no" }],
  }),
  component: TasksPage,
});

function TasksPage() {
  return (
    <Container size={"sm"}>
      <Stack>
        <Title>Dine oppgaver</Title>
        <AuthGuard>
          <Tasks />
        </AuthGuard>
      </Stack>
    </Container>
  );
}
