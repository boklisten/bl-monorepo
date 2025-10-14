import { Container, Loader, Stack, Title } from "@mantine/core";

import CheckoutHandler from "@/features/checkout/CheckoutHandler";

export default function CheckoutPage() {
  return (
    <Container size={"md"}>
      <Stack align={"center"}>
        <Title>Ett øyeblikk...</Title>
        <Loader />
        <CheckoutHandler />
      </Stack>
    </Container>
  );
}
