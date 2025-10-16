import { Container, Title } from "@mantine/core";
import { Metadata } from "next";
import { Suspense } from "react";

import VippsCheckoutFrame from "@/features/payment/VippsCheckoutFrame";

export const metadata: Metadata = {
  title: "Betaling",
};

export default function PaymentPage() {
  return (
    <Container>
      <Title ta={"center"}>Betaling</Title>
      <Suspense>
        <VippsCheckoutFrame />
      </Suspense>
    </Container>
  );
}
