"use client";
import { Badge, Indicator, Tooltip } from "@mantine/core";
import { IconBasket } from "@tabler/icons-react";

import NextAnchor from "@/shared/components/NextAnchor";
import useCart from "@/shared/hooks/useCart";

export default function CartNavbarIndicator() {
  const cart = useCart();

  if (cart.isEmpty()) return null;
  return (
    <Tooltip label={"Gå til handlekurv"}>
      <NextAnchor href={"/handlekurv"}>
        <Indicator
          inline
          label={
            <Badge
              style={{ cursor: "pointer" }}
              circle
              color={"red"}
              size={"sm"}
            >
              {cart.size()}
            </Badge>
          }
        >
          <IconBasket color={"white"} />
        </Indicator>
      </NextAnchor>
    </Tooltip>
  );
}
