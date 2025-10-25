import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";
import { Suspense } from "react";

import ConfirmOrder from "@/features/checkout/ConfirmOrder";

export const metadata: Metadata = {
  title: "Bekreft bestilling",
};

export default function CheckoutConfirmPage() {
  return (
    <Container size={"md"}>
      <Stack>
        <Title>Bekreft bestilling</Title>
        <Suspense>
          <ConfirmOrder />
        </Suspense>
      </Stack>
    </Container>
  );
}
