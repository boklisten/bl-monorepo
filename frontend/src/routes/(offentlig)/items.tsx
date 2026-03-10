import { Container, Stack, Title } from "@mantine/core";
import AuthGuard from "@/features/auth/AuthGuard.tsx";
import AffixCartIndicator from "@/features/cart/AffixCartIndicator.tsx";
import CustomerItemsOverview from "@/features/items/CustomerItemsOverview.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/items")({
  head: () => ({
    meta: [
      { title: "Dine bøker | Boklisten.no" },
      {
        description: "Se og administrer dine nåværende, bestilte og tidligere bøker",
      },
    ],
  }),
  component: YourItemsPage,
});

function YourItemsPage() {
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
