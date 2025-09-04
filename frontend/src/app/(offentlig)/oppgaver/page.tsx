import { Container, Stack, Title } from "@mantine/core";

import AuthGuard from "@/components/common/AuthGuard";
import UserTasks from "@/components/UserTasks";
import { publicApiClient } from "@/utils/publicApiClient";

export default async function TasksPage() {
  const dataKey = "betingelser";
  const cachedAgreement = await publicApiClient.editable_texts
    .key({ key: dataKey })
    .$get()
    .unwrap();
  return (
    <Container>
      <Stack align={"center"}>
        <Title>Dine oppgaver</Title>
        <AuthGuard>
          <UserTasks cachedAgreementText={cachedAgreement.text} />
        </AuthGuard>
      </Stack>
    </Container>
  );
}
