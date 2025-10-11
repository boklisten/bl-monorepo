import { Container, Stack, Title } from "@mantine/core";

import SelectOrderBranch from "@/features/order/SelectOrderBranch";

export default function OrderPage() {
  return (
    <Container size={"md"}>
      <Stack gap={"xs"}>
        <Title>Hvor går du på skole?</Title>
        <SelectOrderBranch />
      </Stack>
    </Container>
  );
}
