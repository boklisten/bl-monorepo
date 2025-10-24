"use client";
import { CartItemOption } from "@boklisten/backend/shared/cart_item";
import { OrderItemType } from "@boklisten/backend/shared/order/order-item/order-item-type";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  SegmentedControl,
  Stack,
  Text,
  Title,
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
  const cart = useCart();
  if (cart.isEmpty()) {
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
    <Stack gap={"xl"}>
      <Stack>
        {cart.get().map((cartItem) => {
          const selectedOption = cart.getSelectedOption(cartItem);
          const getLabel = (option?: CartItemOption) => {
            if (!option) throw new Error("No option for cart item!");
            return `${translations[option.type]} ${option.to ? dayjs(option.to).format("DD/MM/YYYY") : ""}`;
          };
          return (
            <Card withBorder shadow={"md"} key={cartItem.id}>
              <Stack>
                <Card.Section bg={"brand"} p={"xs"}>
                  <Group justify={"space-between"}>
                    <Text fw={"bolder"} c={"white"}>
                      {cartItem.title}
                    </Text>
                    <ActionIcon
                      color={"red"}
                      onClick={() => cart.remove(cartItem.id)}
                    >
                      <IconX />
                    </ActionIcon>
                  </Group>
                </Card.Section>
                <Group justify={"space-between"}>
                  <Group gap={5}>
                    {cartItem.options.length > 1 ? (
                      <SegmentedControl
                        readOnly={cartItem.options.length === 1}
                        data={cartItem.options.map((option, index) => ({
                          label: getLabel(option),
                          value: index.toString(),
                        }))}
                        onChange={(value) => {
                          cart.add({
                            ...cartItem,
                            selectedOptionIndex: Number(value),
                          });
                        }}
                      />
                    ) : (
                      <Text>{getLabel(cartItem.options[0])}</Text>
                    )}
                  </Group>
                  <Group>
                    <Text fw={"bold"}>{selectedOption.price} kr</Text>
                    {selectedOption.payLater && (
                      <Text fs={"italic"} c={"dimmed"} size={"sm"}>
                        betal senere: {selectedOption.payLater} kr
                      </Text>
                    )}
                  </Group>
                </Group>
              </Stack>
            </Card>
          );
        })}
      </Stack>
      <Stack align={"center"}>
        <Group gap={5}>
          <Text>Totalt</Text>
          <Text fw={"bold"}>{cart.calculateTotal()}</Text>
          <Text>kr</Text>
        </Group>
        <Button
          component={Link}
          href={"/kasse"}
          leftSection={<IconCashRegister />}
          size={"md"}
          bg={"green"}
        >
          Gå til kassen
        </Button>
      </Stack>
      {cart
        .get()
        .some(
          (cartItem) =>
            cart.getSelectedOption(cartItem).type === "partly-payment",
        ) && (
        <Stack>
          <Title>Om delbetaling</Title>
          <Text>
            Du betaler restbeløpet på det oppgitte tidspunktet. Restbeløpet
            betales ved vår bokinnkjøpsstand på din skole på slutten av
            semesteret eller på nett. Mange privatister ønsker å selge bøkene
            sine på slutten av semesteret og Boklisten kjøper inn bøker fra
            privatister.
          </Text>
          <Text>
            Hvis du selger boken din til Boklisten vil vi vanligvis betale det
            samme som restbeløpet eller mer.
          </Text>
        </Stack>
      )}
    </Stack>
  );
}
