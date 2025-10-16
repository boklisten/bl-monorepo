"use client";
import { Loader, Title } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

import useApiClient from "@/shared/hooks/useApiClient";
import useCart, { CartItem } from "@/shared/hooks/useCart";
import { showErrorNotification } from "@/shared/utils/notifications";

export default function CheckoutHandler() {
  const { cart, calculateTotal } = useCart();
  const client = useApiClient();
  const mounted = useMounted();
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);

  const initializeCheckoutMutation = useMutation({
    mutationFn: (cartItems: CartItem[]) =>
      client.checkout
        .$post({
          cartItems: cartItems.map((cartItem) =>
            cartItem.type === "buyout"
              ? {
                  itemId: cartItem.item.id,
                  type: cartItem.type,
                }
              : {
                  itemId: cartItem.item.id,
                  type: cartItem.type,
                  date: dayjs(cartItem.date).format("YYYY-MM-DD"),
                },
          ),
        })
        .unwrap(),
    onSuccess: ({ token, checkoutFrontendUrl }) =>
      router.push(
        `/kasse/betaling?token=${token}&checkoutFrontendUrl=${checkoutFrontendUrl}`,
      ),
    onError: () => {
      showErrorNotification("Noe gikk galt under genererering av betaling!");
      router.push("/handlekurv");
    },
  });

  function initializeCheckout() {
    if (hasStarted) return;
    setHasStarted(true);
    initializeCheckoutMutation.mutate(cart);
  }

  if (!mounted) {
    return null;
  }

  if (cart.length === 0) {
    router.push("/handlekurv");
    return null;
  }

  if (calculateTotal() <= 0) {
    // fixme: implement handling of free orders
    showErrorNotification({
      title: "Beløp på under 1 krone er ikke støttet enda!",
      message: "Vennligst ta kontakt om du har spørsmål",
    });
    throw Error("Amounts less than or equal to 0 not implemented yet!");
  }

  initializeCheckout();

  return (
    <>
      <Title>Ett øyeblikk...</Title>
      <Loader />
    </>
  );
}
