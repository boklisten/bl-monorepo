import { Container, Stack, Title } from "@mantine/core";

import ClientPage from "@/app/(offentlig)/oppgaver/ClientPage";
import AuthGuard from "@/features/auth/AuthGuard";
import { publicApiClient } from "@/shared/utils/publicApiClient";

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
          <ClientPage cachedAgreementText={cachedAgreement.text} />
        </AuthGuard>
      </Stack>
    </Container>
  );
}
