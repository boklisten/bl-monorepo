"use client";
import { Skeleton } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import InfoAlert from "@/shared/components/alerts/InfoAlert";
import OrderCard from "@/shared/components/OrderCard";
import useApiClient from "@/shared/hooks/useApiClient";
import { PLEASE_TRY_AGAIN_TEXT } from "@/shared/utils/constants";

export default function OrderHistory() {
  const client = useApiClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: [client.order_history.me.$url()],
    queryFn: () => client.order_history.me.$get().unwrap(),
  });

  if (isLoading) {
    return (
      <>
        {[0, 1, 2, 3].map((index) => (
          <Skeleton h={300} key={`skeleton-${index}`} />
        ))}
      </>
    );
  }

  if (isError || data === undefined) {
    return (
      <ErrorAlert title={"Klarte ikke laste inn ordrehistorikk"}>
        {PLEASE_TRY_AGAIN_TEXT}
      </ErrorAlert>
    );
  }

  if (data.length === 0) {
    return (
      <InfoAlert title={"Du har for øyeblikket ingen ordre"}>
        Trykk på {"'bestill bøker'"} dersom du ønsker å bestille bøker
      </InfoAlert>
    );
  }

  return (
    <>
      {data.map((order) => (
        <OrderCard
          key={order.id}
          id={order.id}
          creationTime={order.creationTime}
          pendingSignature={order.pendingSignature}
          orderItems={order.orderItems}
          payments={order.payments ?? []}
        />
      ))}
    </>
  );
}
