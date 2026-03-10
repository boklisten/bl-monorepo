import { Container, Stack, Title } from "@mantine/core";

import VippsCheckoutStatus from "@/features/payment/VippsCheckoutStatus.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(offentlig)/kasse/betaling/status")({
  head: () => ({
    meta: [{ title: "Kvittering | Boklisten.no" }],
  }),
  component: CheckoutStatusPage,
  validateSearch: (search) => ({
    orderId: (search["orderId"] as string) || "",
  }),
});

function CheckoutStatusPage() {
  const { orderId } = Route.useSearch();

  return (
    <Container size={"md"}>
      <Stack>
        <Title ta={"center"}>Betaling</Title>
        <VippsCheckoutStatus orderId={orderId} />
      </Stack>
    </Container>
  );
}
