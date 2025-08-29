import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import AuthGuard from "@/components/common/AuthGuard";
import PublicBlidSearch from "@/components/search/PublicBlidSearch";

export const metadata: Metadata = {
  title: "Boksøk",
  description: "Sjekk hvem bøker utdelt fra Boklisten tilhører",
};

export default function PublicBlidSearchPage() {
  return (
    <Container size={"sm"}>
      <Stack>
        <Title>Boksøk</Title>
        <AuthGuard>
          <PublicBlidSearch />
        </AuthGuard>
      </Stack>
    </Container>
  );
}
