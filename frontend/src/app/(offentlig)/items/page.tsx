import { Container, Title } from "@mantine/core";
import { Metadata } from "next";

import AuthGuard from "@/components/common/AuthGuard";
import CustomerItemsOverview from "@/components/items/CustomerItemsOverview";

export const metadata: Metadata = {
  title: "Dine bøker",
  description: "Se og administrer dine nåværende, bestilte og tidligere bøker",
};

export default function YourItemsPage() {
  return (
    <Container size={"md"}>
      <Title>Dine bøker</Title>
      <AuthGuard>
        <CustomerItemsOverview />
      </AuthGuard>
    </Container>
  );
}
