"use client";
import { NavLink, Skeleton, Title } from "@mantine/core";
import { useTimeout } from "@mantine/hooks";
import { IconBasket, IconBook } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import SuccessAlert from "@/shared/components/alerts/SuccessAlert";
import useApiClient from "@/shared/hooks/useApiClient";
import useCart from "@/shared/hooks/useCart";
import { PLEASE_TRY_AGAIN_TEXT } from "@/shared/utils/constants";

function BackToCartButton() {
  return (
    <NavLink
      component={Link}
      href={"/handlekurv"}
      leftSection={<IconBasket />}
      active
      bdrs={5}
      bg={"green"}
      c={"white"}
      fw={"bolder"}
      label={"Gå til handlekurv"}
    />
  );
}

export default function VippsCheckoutStatus({
  orderReceipt,
}: {
  orderReceipt: ReactNode;
}) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const queryKey = [client.checkout({ orderId }).$url(), orderId];

  const MAX_ATTEMPTS = 7;
  const [attempt, setAttempt] = useState(1);
  const { start: checkStatus } = useTimeout(
    async () => {
      await queryClient.invalidateQueries({ queryKey });
      setAttempt((prev) => prev + 1);
    },
    250 * attempt ** 2,
  );

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => client.checkout({ orderId }).$get().unwrap(),
  });

  useEffect(() => {
    if (data === "PaymentInitiated" && attempt <= MAX_ATTEMPTS) checkStatus();
  }, [attempt, checkStatus, data]);

  useEffect(() => {
    if (data === "PaymentSuccessful") {
      clearCart();
    }
  }, [clearCart, data]);

  if (isLoading) {
    return <Skeleton h={90} />;
  }

  if (isError) {
    return (
      <ErrorAlert title={"Klarte ikke hente betalingsstatus"}>
        {PLEASE_TRY_AGAIN_TEXT}
      </ErrorAlert>
    );
  }

  if (data === "PaymentInitiated" && attempt <= MAX_ATTEMPTS) {
    return <Skeleton h={90} />;
  }

  if (data === "PaymentSuccessful") {
    return (
      <>
        <Title order={2}>Kvittering</Title>
        <SuccessAlert title={"Din ordre er bekreftet!"}>
          Kvittering har blitt sendt på e-post. Du kan se dine nåværende bøker
          ved å trykke på {'"Dine bøker"'}
        </SuccessAlert>
        {orderReceipt}
        <NavLink
          component={Link}
          href={"/items"}
          leftSection={<IconBook />}
          active
          variant={"filled"}
          fw={"bolder"}
          label={"Dine bøker"}
        />
      </>
    );
  }

  if (data === "SessionExpired") {
    return (
      <>
        <ErrorAlert title={"Betalingsforespørselen har utløpt"}>
          Du kan starte på nytt ved å trykke på {'"Gå til handlekurv"'}
        </ErrorAlert>
        <BackToCartButton />
      </>
    );
  }

  if (data === "PaymentTerminated") {
    return (
      <>
        <ErrorAlert title={"Du har avbrutt betalingen"}>
          Du kan starte på nytt ved å trykke på {'"Gå til handlekurv"'}
        </ErrorAlert>
        <BackToCartButton />
      </>
    );
  }

  return (
    <>
      <ErrorAlert title={"Noe gikk galt under betalingen"}>
        {PLEASE_TRY_AGAIN_TEXT}
      </ErrorAlert>
      <BackToCartButton />
    </>
  );
}
