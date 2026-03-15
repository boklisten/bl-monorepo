import { Button, Table } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";

import useApiClient from "@/shared/hooks/useApiClient";
import useCart from "@/shared/hooks/useCart";
import { showErrorNotification } from "@/shared/utils/notifications";
import { useNavigate } from "@tanstack/react-router";

export default function ConfirmOrder({ orderId }: { orderId: string }) {
  const cart = useCart();
  const { api } = useApiClient();
  const navigate = useNavigate();

  const confirmCheckoutMutation = useMutation(
    api.checkout.confirmCheckout.mutationOptions({
      onError: () => showErrorNotification("Klarte ikke bekrefte ordre!"),
      onSuccess: () => {
        cart.clear();
        navigate({ to: "/order-history" });
      },
    }),
  );
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
          confirmCheckoutMutation.mutate({ params: { orderId: orderId ?? "" } });
        }}
      >
        Bekreft
      </Button>
    </>
  );
}
