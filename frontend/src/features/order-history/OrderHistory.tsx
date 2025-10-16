"use client";
import { Card, Group, Skeleton, Stack, Text, Title } from "@mantine/core";
import {
  IconCheck,
  IconExclamationMark,
  IconQrcode,
  IconSignature,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

import OrderItemTypeIcon from "@/features/order-history/OrderItemTypeIcon";
import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import InfoAlert from "@/shared/components/alerts/InfoAlert";
import WarningAlert from "@/shared/components/alerts/WarningAlert";
import useApiClient from "@/shared/hooks/useApiClient";
import { PLEASE_TRY_AGAIN_TEXT } from "@/shared/utils/constants";

export default function OrderHistory({ limit }: { limit?: number }) {
  const client = useApiClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: [client.order_history.me.$url()],
    queryFn: () => client.order_history.me.$get().unwrap(),
  });

  if (isLoading) {
    return (
      <>
        {[0, 1, 2, 3].slice(0, limit).map((index) => (
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
      {data.slice(0, limit).map((order) => (
        <Card shadow="sm" padding="md" radius="md" withBorder key={order.id}>
          <Stack>
            <Group justify={"space-between"}>
              <Title order={5} c={"dimmed"}>
                #{order.id}
              </Title>
              <Text>
                {dayjs(order.creationTime).format("DD/MM/YYYY HH:mm:ss")}
              </Text>
            </Group>
            {order.pendingSignature ? (
              <WarningAlert title={"Denne orderen krever gyldig signatur"}>
                Du må ha en gyldig signatur før du kan motta disse bøkene. Sjekk
                dine oppgaver for mer informasjon
              </WarningAlert>
            ) : (
              <Group gap={5}>
                <IconSignature />
                <Text c={"dimmed"}>Denne orderen krever ikke signering</Text>
              </Group>
            )}
            <Stack gap={"xs"}>
              <Title order={5}>Bøker</Title>
              {order.orderItems.map((orderItem) => (
                <Card withBorder key={orderItem.item}>
                  <Stack gap={5}>
                    <Group justify={"space-between"}>
                      <Title order={6}>{orderItem.title}</Title>
                      {orderItem.unitPrice && (
                        <Text>{Math.abs(orderItem.unitPrice)} kr</Text>
                      )}
                    </Group>
                    {orderItem.blid && (
                      <Group gap={2}>
                        <IconQrcode size={18} />
                        <Text>{orderItem.blid}</Text>
                      </Group>
                    )}
                    <Group gap={2}>
                      <OrderItemTypeIcon type={orderItem.type} />
                      <Text>{orderItem.typeLabel}</Text>
                      {["rent", "partly-payment", "loan"].includes(
                        orderItem.type,
                      ) &&
                        orderItem.info?.to && (
                          <>
                            til
                            <Text size={"sm"} fw={"bold"}>
                              {dayjs(orderItem.info.to).format("DD/MM/YYYY")}
                            </Text>
                          </>
                        )}
                    </Group>
                    {orderItem.movedToOrder && (
                      <Text c={"dimmed"}>
                        Denne boken har blitt flyttet til en annen ordre.
                      </Text>
                    )}
                  </Stack>
                </Card>
              ))}
            </Stack>
            {order.payments && order.payments.length > 0 && (
              <Stack gap={5}>
                <Title order={5}>Betaling</Title>
                {order.payments.map((payment) => (
                  <Card withBorder key={payment.id}>
                    <Group justify={"space-between"}>
                      <Text key={payment.id}>
                        {payment.amount > 0 ? "Betalt" : "Refundert"}{" "}
                        {Math.abs(payment.amount)} kr med {payment.methodLabel}
                      </Text>
                      <Group gap={5}>
                        {payment.confirmed ? (
                          <>
                            <IconCheck color={"green"} />
                            <Text c={"green"}>Bekreftet</Text>
                          </>
                        ) : (
                          <>
                            <IconExclamationMark />
                            <Text>Bekreftet</Text>
                          </>
                        )}
                      </Group>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Card>
      ))}
    </>
  );
}
