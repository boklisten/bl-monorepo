import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import AuthGuard from "@/components/common/AuthGuard";
import { MatchesList } from "@/components/matches/matchesList/MatchesList";

export const metadata: Metadata = {
  title: "Mine overleveringer",
  description: "Overleveringer av bøker",
};

export default function MatchesPage() {
  return (
    <Container>
      <Stack>
        <Title>Mine overleveringer</Title>
        <AuthGuard>
          <MatchesList />
        </AuthGuard>
      </Stack>
    </Container>
  );
}
