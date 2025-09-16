import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import EmailConfirmer from "@/features/user/EmailConfirmer";

export const metadata: Metadata = {
  title: "Bekreft e-post",
  description:
    "Bekreft din e-postadresse, slik at du får viktig informasjon fra oss.",
};

export default async function TokenPage({
  params,
}: PageProps<"/auth/email/confirm/[confirmationId]">) {
  const { confirmationId } = await params;
  return (
    <Container>
      <Stack>
        <Title>Bekreft e-post</Title>
        <EmailConfirmer confirmationId={confirmationId} />
      </Stack>
    </Container>
  );
}
