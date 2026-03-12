import { Container, Stack, Title } from "@mantine/core";

import ConfirmOrder from "@/features/checkout/ConfirmOrder.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/kasse/bekreft")({
  head: () => ({
    meta: [{ title: "Bekreft bestilling | Boklisten.no" }],
  }),
  component: CheckoutConfirmPage,
  validateSearch: (search) => ({
    orderId: (search["orderId"] as string) || "",
  }),
});

function CheckoutConfirmPage() {
  return (
    <Container size={"md"}>
      <Stack>
        <Title>Bekreft bestilling</Title>
        <ConfirmOrder />
      </Stack>
    </Container>
  );
}
