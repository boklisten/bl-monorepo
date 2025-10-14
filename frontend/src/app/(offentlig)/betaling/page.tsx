import { Container, Title } from "@mantine/core";
import { Metadata } from "next";
import { Suspense } from "react";

import VippsCheckoutFrame from "@/features/payment/VippsCheckoutFrame";

export const metadata: Metadata = {
  title: "Betaling",
  description: "Betal for din ordre med Vipps",
};

export default function PaymentPage() {
  return (
    <Container ta={"center"}>
      <Title>Betaling</Title>
      <Suspense>
        <VippsCheckoutFrame />
      </Suspense>
    </Container>
  );
}
