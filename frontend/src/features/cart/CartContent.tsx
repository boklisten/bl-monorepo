"use client";
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
import Link from "next/link";
import { Activity } from "react";

import InfoAlert from "@/shared/components/alerts/InfoAlert";
import useCart from "@/shared/hooks/useCart";

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
                          label: cart.getOptionLabel(option),
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
                      <Text>{cart.getOptionLabel(cartItem.options[0])}</Text>
                    )}
                  </Group>
                  <Group>
                    <Text fw={"bold"}>{selectedOption.price} kr</Text>
                    <Activity
                      mode={selectedOption.payLater ? "visible" : "hidden"}
                    >
                      <Text fs={"italic"} c={"dimmed"} size={"sm"}>
                        betal senere: {selectedOption.payLater} kr
                      </Text>
                    </Activity>
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
      <Activity
        mode={
          cart
            .get()
            .some(
              (cartItem) =>
                cart.getSelectedOption(cartItem).type === "partly-payment",
            )
            ? "visible"
            : "hidden"
        }
      >
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
      </Activity>
    </Stack>
  );
}
