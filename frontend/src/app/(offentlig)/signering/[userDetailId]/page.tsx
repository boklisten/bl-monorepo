import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import SignAgreement from "@/components/SignAgreement";
import { publicApiClient } from "@/utils/publicApiClient";

export const metadata: Metadata = {
  title: "Signering",
  description: "Signer avtale for å få bøker fra Boklisten.no",
};
export default async function SignaturePage({
  params,
}: PageProps<"/signering/[userDetailId]">) {
  const { userDetailId } = await params;
  const dataKey = "betingelser";
  const cachedAgreement = await publicApiClient.editable_texts
    .key({ key: dataKey })
    .$get()
    .unwrap();

  return (
    <Container>
      <Stack align={"center"}>
        <Title>Signering</Title>
        <SignAgreement
          userDetailId={userDetailId}
          cachedAgreementText={cachedAgreement.text}
        />
      </Stack>
    </Container>
  );
}
