import { Container, Stack, Title } from "@mantine/core";

import AuthGuard from "@/features/auth/AuthGuard";
import UserTasks from "@/features/tasks/UserTasks";
import { publicApiClient } from "@/shared/hooks/publicApiClient";

export default async function TasksPage() {
  const dataKey = "betingelser";
  const cachedAgreement = await publicApiClient.editable_texts
    .key({ key: dataKey })
    .$get()
    .unwrap();
  return (
    <Container size={"sm"}>
      <Stack>
        <Title>Dine oppgaver</Title>
        <AuthGuard>
          <UserTasks cachedAgreementText={cachedAgreement.text} />
        </AuthGuard>
      </Stack>
    </Container>
  );
}
