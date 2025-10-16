"use client";
import {
  Button,
  Card,
  Loader,
  NavLink,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconBasket, IconBook, IconRefresh } from "@tabler/icons-react";
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

const calculateTotalWait = (attempts: number) =>
  ((n) => (n * (n + 1) * (2 * n + 1)) / 6)(attempts);

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

  const MAX_ATTEMPTS = 5;
  const [attempt, setAttempt] = useState(1);
  const [secondsBeforeNextAttempt, setSecondsBeforeNextAttempt] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: [client.checkout.poll({ orderId }).$url(), orderId],
    queryFn: () => client.checkout.poll({ orderId }).$get().unwrap(),
  });

  useEffect(() => {
    if (data !== "PaymentInitiated" || attempt > MAX_ATTEMPTS) return;
    function startExponentialWait() {
      const waitInSeconds = attempt ** 2;
      setSecondsBeforeNextAttempt(waitInSeconds);

      const interval = setInterval(() => {
        setSecondsBeforeNextAttempt((t) => +(t - 0.1).toFixed(1));
      }, 100);

      const timeout = setTimeout(async () => {
        clearInterval(interval);
        await queryClient.invalidateQueries({
          queryKey: [client.checkout.poll({ orderId }).$url(), orderId],
        });
        setAttempt((a) => a + 1);
      }, waitInSeconds * 1000);
      return { interval, timeout };
    }

    const { interval, timeout } = startExponentialWait();
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [attempt, client, data, orderId, queryClient]);

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

  if (data === "PaymentInitiated") {
    return attempt <= MAX_ATTEMPTS ? (
      <Card withBorder shadow={"md"}>
        <Stack>
          <Stack gap={5}>
            <Title order={3}>Prosesserer betaling...</Title>
            <Text fs={"italic"}>
              Venter på betalingsstatus fra Vipps. Vennligst ikke lukk fanen.
            </Text>
          </Stack>
          {secondsBeforeNextAttempt < 1 ? (
            <Loader type={"dots"} />
          ) : (
            <Text>
              Prøver igjen om {secondsBeforeNextAttempt.toFixed(0)} sekunder
            </Text>
          )}
          <Text size={"sm"} fs={"italic"}>
            Forsøk {attempt} av {MAX_ATTEMPTS}
          </Text>
        </Stack>
      </Card>
    ) : (
      <>
        <ErrorAlert title={"Vipps bruke for lang tid på å svare"}>
          Vi mottok ikke oppdatert betalingsinformasjon etter å ha ventet i{" "}
          {calculateTotalWait(attempt)} sekunder. Du kan prøve igjen eller ta
          kontakt hvis problemet vedvarer.
        </ErrorAlert>
        <Button
          leftSection={<IconRefresh />}
          onClick={() => {
            setAttempt(1);
          }}
        >
          Prøv igjen
        </Button>
      </>
    );
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
