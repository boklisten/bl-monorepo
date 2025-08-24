import { Container, Stack, Typography } from "@mui/material";

import AuthGuard from "@/components/common/AuthGuard";
import UserTasks from "@/components/UserTasks";
import { publicApiClient } from "@/utils/api/publicApiClient";

export default async function TasksPage() {
  const dataKey = "betingelser";
  const cachedAgreement = await publicApiClient.editable_texts
    .key({ key: dataKey })
    .$get()
    .unwrap();
  return (
    <AuthGuard>
      <Container>
        <Stack alignItems={"center"} gap={1}>
          <Typography variant="h1">Dine oppgaver</Typography>
          <UserTasks cachedAgreementText={cachedAgreement.text} />
        </Stack>
      </Container>
    </AuthGuard>
  );
}
