import { Container, Stack, Title } from "@mantine/core";
import EmailConfirmer from "@/features/user/EmailConfirmer";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/auth/email/confirm/$confirmationId")({
  head: () => ({
    meta: [
      { title: "Bekreft e-post | Boklisten.no" },
      {
        description: "Bekreft din e-postadresse, slik at du får viktig informasjon fra oss.",
      },
    ],
  }),
  component: TokenPage,
});

function TokenPage() {
  const { confirmationId } = Route.useParams();
  return (
    <Container>
      <Stack>
        <Title>Bekreft e-post</Title>
        <EmailConfirmer confirmationId={confirmationId} />
      </Stack>
    </Container>
  );
}
