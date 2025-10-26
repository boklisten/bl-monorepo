// useSet does not support React Compiler yet
"use no memo";
"use client";

import { CartItem } from "@boklisten/backend/shared/cart_item";
import { Affix, Box, Button, Card, Stack, Text } from "@mantine/core";
import { useSet } from "@mantine/hooks";
import { IconBasket, IconBasketCheck } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Activity } from "react";

import useCart from "@/shared/hooks/useCart";
import { publicApiClient } from "@/shared/utils/publicApiClient";

export default function SelectSubjects({
  branchId,
  cachedSubjects,
}: {
  branchId: string;
  cachedSubjects: Record<string, CartItem[]>;
}) {
  const router = useRouter();
  const cart = useCart();
  const selectedSubjects = useSet<string>();
  const { data } = useQuery({
    queryKey: [publicApiClient.subjects({ branchId }).$url(), branchId],
    queryFn: () => publicApiClient.subjects({ branchId }).$get().unwrap(),
  });

  const subjects = data ?? cachedSubjects;

  return (
    <>
      {Object.entries(subjects)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name]) => (
          <Button
            leftSection={
              selectedSubjects.has(name) ? <IconBasketCheck /> : undefined
            }
            bg={selectedSubjects.has(name) ? "green" : ""}
            key={name}
            onClick={() => {
              if (selectedSubjects.has(name)) {
                selectedSubjects.delete(name);
              } else {
                selectedSubjects.add(name);
              }
            }}
          >
            {name}
          </Button>
        ))}
      <Activity mode={selectedSubjects.size > 0 ? "visible" : "hidden"}>
        <Affix w={"100%"}>
          <Card withBorder shadow={"md"}>
            <Stack align={"center"} gap={"xs"}>
              <Text fs={"italic"}>{selectedSubjects.size} fag</Text>
              <Box>
                <Button
                  onClick={() => {
                    cart.clear();
                    for (const subject of selectedSubjects) {
                      const cartItems = subjects[subject] ?? [];
                      for (const cartItem of cartItems) {
                        cart.add(cartItem);
                      }
                    }
                    selectedSubjects.clear();
                    router.push("/handlekurv");
                  }}
                  leftSection={<IconBasket />}
                  bg={"green"}
                  c={"white"}
                  fw={"bolder"}
                >
                  Generer boklisten din
                </Button>
              </Box>
            </Stack>
          </Card>
        </Affix>
      </Activity>
    </>
  );
}
