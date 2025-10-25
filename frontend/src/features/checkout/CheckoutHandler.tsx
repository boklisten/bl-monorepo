"use client";
import { CartItem } from "@boklisten/backend/shared/cart_item";
import { Loader, Title } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

import useApiClient from "@/shared/hooks/useApiClient";
import useCart from "@/shared/hooks/useCart";
import { showErrorNotification } from "@/shared/utils/notifications";

export default function CheckoutHandler() {
  const cart = useCart();
  const client = useApiClient();
  const mounted = useMounted();
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);

  const initializeCheckoutMutation = useMutation({
    mutationFn: (cartItems: CartItem[]) =>
      client.checkout
        .$post({
          cartItems: cartItems.map((cartItem) => {
            const selectedOption = cart.getSelectedOption(cartItem);
            return {
              id: cartItem.id,
              branchId: cartItem.branchId,
              type: selectedOption.type,
              price: selectedOption.price,
              to: dayjs(selectedOption.to).format("YYYY-MM-DD"),
            };
          }),
        })
        .unwrap(),
    onSuccess: async ({ nextStep, orderId, token, checkoutFrontendUrl }) => {
      switch (nextStep) {
        case "confirm": {
          router.replace(`/kasse/bekreft?orderId=${orderId}`);
          break;
        }
        case "payment":
          router.replace(
            `/kasse/betaling?token=${token}&checkoutFrontendUrl=${checkoutFrontendUrl}`,
          );
          break;
        default:
          throw new Error("Unknown checkout step");
      }
    },
    onError: () => {
      showErrorNotification("Noe gikk galt under genererering av betaling!");
      router.push("/handlekurv");
    },
  });

  function initializeCheckout() {
    if (hasStarted) return;
    setHasStarted(true);
    initializeCheckoutMutation.mutate(cart.get());
  }

  if (!mounted) {
    return null;
  }

  if (cart.isEmpty()) {
    router.push("/handlekurv");
    return null;
  }

  initializeCheckout();

  return (
    <>
      <Title>Ett øyeblikk...</Title>
      <Loader />
    </>
  );
}
