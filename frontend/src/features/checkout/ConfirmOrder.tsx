"use client";
import { Button, Table } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

import useApiClient from "@/shared/hooks/useApiClient";
import useCart from "@/shared/hooks/useCart";
import { showErrorNotification } from "@/shared/utils/notifications";

export default function ConfirmOrder() {
  const cart = useCart();
  const router = useRouter();
  const client = useApiClient();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";

  const confirmCheckoutMutation = useMutation({
    mutationFn: () => client.checkout.confirm({ orderId }).$post().unwrap(),
    onError: () => showErrorNotification("Klarte ikke bekrefte ordre!"),
    onSuccess: () => {
      cart.clear();
      router.push("/order-history");
    },
  });
  return (
    <>
      <Table
        data={{
          caption:
            "Du kan hente bøkene på stand i våre åpningstider. Dersom du går på VGS kan du kontakte en av våre kontakt-elever.",
          head: ["Tittel", "Handling"],
          body: cart
            .get()
            .map((cartItem) => [
              cartItem.title,
              cart.getOptionLabel(cart.getSelectedOption(cartItem)),
            ]),
        }}
      />
      <Button
        loading={confirmCheckoutMutation.isPending}
        onClick={() => {
          confirmCheckoutMutation.mutate();
        }}
      >
        Bekreft
      </Button>
    </>
  );
}
