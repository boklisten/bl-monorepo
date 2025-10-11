import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import AuthGuard from "@/features/auth/AuthGuard";
import OrderHistory from "@/features/order-history/OrderHistory";

export const metadata: Metadata = {
  title: "Ordrehistorikk",
  description: "Se historikken over dine ordre",
};

export default function OrdersPage() {
  return (
    <AuthGuard>
      <Container size={"md"}>
        <Stack>
          <Title>Ordrehistorikk</Title>
          <OrderHistory />
        </Stack>
      </Container>
    </AuthGuard>
  );
}
