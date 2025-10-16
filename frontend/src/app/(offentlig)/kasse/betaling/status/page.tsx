import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";
import { Suspense } from "react";

import OrderHistory from "@/features/order-history/OrderHistory";
import VippsCheckoutStatus from "@/features/payment/VippsCheckoutStatus";

export const metadata: Metadata = {
  title: "Kvittering",
};

export default function CheckoutStatusPage() {
  return (
    <Container size={"md"}>
      <Stack>
        <Title ta={"center"}>Betaling</Title>
        <Suspense>
          <VippsCheckoutStatus orderReceipt={<OrderHistory limit={1} />} />
        </Suspense>
      </Stack>
    </Container>
  );
}
