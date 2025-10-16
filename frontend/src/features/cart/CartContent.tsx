"use client";
import { OrderItemType } from "@boklisten/backend/shared/order/order-item/order-item-type";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconBook,
  IconCashRegister,
  IconShoppingCart,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import Link from "next/link";

import InfoAlert from "@/shared/components/alerts/InfoAlert";
import useCart from "@/shared/hooks/useCart";

const translations = {
  rent: "lån til",
  return: "returner",
  extend: "forleng til",
  cancel: "kanseller",
  buy: "kjøp",
  "partly-payment": "delbetaling til",
  buyback: "tilbakekjøp",
  buyout: "kjøp ut",
  sell: "selg",
  loan: "lån til",
  "invoice-paid": "betale faktura",
  "match-receive": "motta fra elev",
  "match-deliver": "overlevere til elev",
} satisfies Record<OrderItemType, string>;

export default function CartContent() {
  const { cart, removeFromCart } = useCart();
  if (cart.length === 0) {
    return (
      <>
        <InfoAlert title={"Handlekurven er tom"}>
          Du kan finne nye bøker ved å trykke på {"'bestill bøker'"} eller
          administrere dine nåværende bøker på {"'dine bøker'"}.
        </InfoAlert>
        <Group>
          <Button
            component={Link}
            href={"/bestilling"}
            leftSection={<IconShoppingCart />}
          >
            Bestill bøker
          </Button>
          <Button component={Link} href={"/items"} leftSection={<IconBook />}>
            Dine bøker
          </Button>
        </Group>
      </>
    );
  }
  return (
    <>
      {cart.map((cartItem) => (
        <Card withBorder shadow={"md"} key={cartItem.item.id}>
          <Stack>
            <Card.Section bg={"brand"} p={"xs"}>
              <Group justify={"space-between"}>
                <Text fw={"bolder"} c={"white"}>
                  {cartItem.item.title}
                </Text>
                <ActionIcon
                  color={"red"}
                  onClick={() => removeFromCart(cartItem.item.id)}
                >
                  <IconX />
                </ActionIcon>
              </Group>
            </Card.Section>
            <Group justify={"space-between"}>
              <Group gap={5}>
                <Text>{translations[cartItem.type]}</Text>
                {"date" in cartItem && (
                  <Text fw={"bolder"}>
                    {dayjs(cartItem.date).format("DD/MM/YYYY")}
                  </Text>
                )}
              </Group>
              <Text fw={"bold"}>{cartItem.price} kr</Text>
            </Group>
          </Stack>
        </Card>
      ))}
      <Box mt={"sm"}>
        <Button
          component={Link}
          href={"/kasse"}
          leftSection={<IconCashRegister />}
          size={"md"}
          bg={"green"}
        >
          Gå til kassen
        </Button>
      </Box>
    </>
  );
}
