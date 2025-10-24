"use client";
import { Affix, Box, Card, Group, NavLink, Stack, Text } from "@mantine/core";
import { IconBasket } from "@tabler/icons-react";
import Link from "next/link";

import useCart from "@/shared/hooks/useCart";

export default function AffixCartIndicator() {
  const cart = useCart();
  if (cart.isEmpty()) {
    return null;
  }
  return (
    <Affix w={"100%"}>
      <Card withBorder shadow={"md"}>
        <Stack align={"center"} gap={"xs"}>
          <Stack gap={5} align={"center"}>
            <Text fs={"italic"}>
              {cart.size()} {cart.size() > 1 ? "bøker" : "bok"}
            </Text>
            <Group gap={5}>
              Totalt
              <Text fw={"bold"}>{cart.calculateTotal()} kr</Text>
            </Group>
          </Stack>
          <Box>
            <NavLink
              component={Link}
              href={"/handlekurv"}
              leftSection={<IconBasket />}
              active
              bdrs={5}
              bg={"green"}
              c={"white"}
              fw={"bolder"}
              label={"Gå til handlekurv"}
            />
          </Box>
        </Stack>
      </Card>
    </Affix>
  );
}
