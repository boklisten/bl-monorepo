import { Skeleton } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import OrderCard from "@/shared/components/OrderCard";
import useApiClient from "@/shared/hooks/useApiClient";
import { PLEASE_TRY_AGAIN_TEXT } from "@/shared/utils/constants";

export default function OrderReceipt({ orderId }: { orderId: string }) {
  const client = useApiClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: [client.order_history.me({ orderId }).$url(), orderId],
    queryFn: () => client.order_history.me({ orderId }).$get().unwrap(),
  });

  if (isLoading) {
    return <Skeleton h={300} />;
  }

  if (isError || !data) {
    return (
      <ErrorAlert title={"Klarte ikke laste inn ordrekvittering"}>
        {PLEASE_TRY_AGAIN_TEXT}
      </ErrorAlert>
    );
  }
  return (
    <OrderCard
      id={data.id}
      creationTime={data.creationTime}
      pendingSignature={data.pendingSignature}
      orderItems={data.orderItems}
      payments={data.payments}
    />
  );
}
