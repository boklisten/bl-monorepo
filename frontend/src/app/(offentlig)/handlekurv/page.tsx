import { Container, Stack, Title } from "@mantine/core";
import { Metadata } from "next";

import CartContent from "@/features/cart/CartContent";

export const metadata: Metadata = {
  title: "Handlekurv",
  description: "Se hvilke bøker du har lagt til i handlekurven din",
};
export default function CartPage() {
  return (
    <Container size={"md"}>
      <Stack>
        <Title>Handlekurv</Title>
        <CartContent />
      </Stack>
    </Container>
  );
}
