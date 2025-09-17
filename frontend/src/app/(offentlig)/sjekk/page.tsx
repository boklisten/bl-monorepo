import { Container, Stack, Title, Text } from "@mantine/core";
import { Metadata } from "next";

import AuthGuard from "@/features/auth/AuthGuard";
import PublicBlidSearch from "@/features/info/PublicBlidSearch";

export const metadata: Metadata = {
  title: "Boksøk",
  description: "Sjekk hvem bøker utdelt fra Boklisten tilhører",
};

export default function PublicBlidSearchPage() {
  return (
    <Container size={"xs"}>
      <Stack>
        <Title ta={"center"}>Boksøk</Title>
        <Text ta={"center"}>
          Skriv inn en bok sin unike ID (8 eller 12 siffer) for å se hvem den
          tilhører. Du kan også scanne bokas unike ID med kamera.
        </Text>
        <AuthGuard>
          <PublicBlidSearch />
        </AuthGuard>
      </Stack>
    </Container>
  );
}
