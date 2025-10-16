import { Container, Stack } from "@mantine/core";

import CheckoutHandler from "@/features/checkout/CheckoutHandler";

export default function CheckoutPage() {
  return (
    <Container size={"md"}>
      <Stack align={"center"} gap={"xs"}>
        <CheckoutHandler />
      </Stack>
    </Container>
  );
}
