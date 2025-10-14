import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import AuthGuard from "@/features/auth/AuthGuard";
import AffixCartIndicator from "@/features/cart/AffixCartIndicator";
import CustomerItemsOverview from "@/features/items/CustomerItemsOverview";

export const metadata: Metadata = {
  title: "Dine bøker",
  description: "Se og administrer dine nåværende, bestilte og tidligere bøker",
};

export default function YourItemsPage() {
  return (
    <Container size={"md"}>
      <Title>Dine bøker</Title>
      <AuthGuard>
        <Stack gap={"xl"}>
          <CustomerItemsOverview />
          <AffixCartIndicator />
        </Stack>
      </AuthGuard>
    </Container>
  );
}
