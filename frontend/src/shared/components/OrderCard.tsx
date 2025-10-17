import { OrderItem } from "@boklisten/backend/shared/order/order-item/order-item";
import { Card, Group, Stack, Text, Title } from "@mantine/core";
import {
  IconCheck,
  IconExclamationMark,
  IconQrcode,
  IconSignature,
} from "@tabler/icons-react";
import dayjs from "dayjs";

import WarningAlert from "@/shared/components/alerts/WarningAlert";
import OrderItemTypeIcon from "@/shared/components/OrderItemTypeIcon";

export default function OrderCard({
  id,
  creationTime,
  pendingSignature,
  orderItems,
  payments,
}: {
  id: string;
  creationTime: Date | undefined;
  pendingSignature: boolean;
  orderItems: (OrderItem & { typeLabel: string })[];
  payments: {
    id: string;
    methodLabel: string;
    amount: number;
    confirmed: boolean;
  }[];
}) {
  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Stack>
        <Group justify={"space-between"}>
          <Title order={5} c={"dimmed"}>
            #{id}
          </Title>
          <Text>{dayjs(creationTime).format("DD/MM/YYYY HH:mm:ss")}</Text>
        </Group>
        {pendingSignature ? (
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
          {orderItems.map((orderItem) => (
            <Card withBorder key={orderItem.title + orderItem.blid}>
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
                  {["rent", "partly-payment", "loan", "extend"].includes(
                    orderItem.type,
                  ) &&
                    orderItem.info?.to && (
                      <>
                        til
                        <Text size={"sm"} fw={"bold"}>
                          {dayjs(orderItem.info?.to).format("DD/MM/YYYY")}
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
        {payments.length > 0 && (
          <Stack gap={5}>
            <Title order={5}>Betaling</Title>
            {payments.map((payment) => (
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
  );
}
