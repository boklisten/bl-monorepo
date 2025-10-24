import { Container, Stack } from "@mantine/core";

import AuthGuard from "@/features/auth/AuthGuard";
import CheckoutHandler from "@/features/checkout/CheckoutHandler";

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <Container size={"md"}>
        <Stack align={"center"} gap={"xs"}>
          <CheckoutHandler />
        </Stack>
      </Container>
    </AuthGuard>
  );
}
