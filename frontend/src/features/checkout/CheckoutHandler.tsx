"use client";
import { useMounted } from "@mantine/hooks";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

import useApiClient from "@/shared/hooks/useApiClient";
import useCart from "@/shared/hooks/useCart";
import { showErrorNotification } from "@/shared/utils/notifications";

export default function CheckoutHandler() {
  const { cart, calculateTotal } = useCart();
  const client = useApiClient();
  const mounted = useMounted();
  const router = useRouter();

  async function createVippsCheckout() {
    try {
      const response = await client.checkout
        .$post({
          cartItems: cart.map((cartItem) => ({
            itemId: cartItem.item.id,
            type: cartItem.type,
            date: dayjs(cartItem.deadline).format("YYYY-MM-DD"),
          })),
        })
        .unwrap();
      if (!response) {
        showErrorNotification("Noe gikk galt under genererering av betaling!");
        console.error("Noe gikk galt under genererering av betaling!");
        return;
      }
      router.push(
        `/betaling?token=${response.token}&checkoutFrontendUrl=${response.checkoutFrontendUrl}`,
      );
    } catch (error) {
      showErrorNotification("Klarte ikke genererere betaling!");
      throw error;
    }
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
  createVippsCheckout();

  return null;
}
