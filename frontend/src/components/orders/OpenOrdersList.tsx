"use client";
import { Alert, Box, Button, Table, Tooltip } from "@mantine/core";
import { IconInfoCircle, IconShoppingCart } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDialogs, useNotifications } from "@toolpad/core";
import moment from "moment";
import { useRouter } from "next/navigation";

import useApiClient from "@/utils/api/useApiClient";
import {
  ERROR_NOTIFICATION,
  SUCCESS_NOTIFICATION,
} from "@/utils/notifications";

export default function OpenOrdersList({
  openOrderItems,
}: {
  openOrderItems: {
    orderId: string;
    itemId: string;
    deadline: string;
    title: string;
    cancelable: boolean;
  }[];
}) {
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const queryClient = useQueryClient();
  const router = useRouter();
  const client = useApiClient();

  const cancelOrderItemMutation = useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: string; itemId: string }) =>
      client.v2.orders.cancel_order_item.$post({ orderId, itemId }).unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.v2.orders.open_orders.$url()],
      }),
    onSuccess: () =>
      notifications.show("Avbestilling var vellykket!", SUCCESS_NOTIFICATION),
    onError: () =>
      notifications.show("Klarte ikke avbestille bok!", ERROR_NOTIFICATION),
  });

  return (
    <>
      {(openOrderItems?.length ?? 0) > 0 ? (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Tittel</Table.Th>
              <Table.Th>Frist</Table.Th>
              <Table.Th>Handling</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {openOrderItems?.map((orderItem) => (
              <Table.Tr key={orderItem.orderId + orderItem.itemId}>
                <Table.Td>{orderItem.title}</Table.Td>
                <Table.Td>
                  {moment(orderItem.deadline).format("DD/MM/YYYY")}
                </Table.Td>
                <Table.Td>
                  <Tooltip
                    disabled={orderItem.cancelable}
                    label={
                      "Ikke tilgjenglig for øyeblikket. Ta kontakt dersom du ønsker å avbestille"
                    }
                  >
                    <Button
                      variant={"subtle"}
                      disabled={!orderItem.cancelable}
                      color={"red"}
                      loading={cancelOrderItemMutation.isPending}
                      onClick={async () => {
                        if (
                          await dialogs.confirm(
                            `Du er nå i ferd med å avbestille ${orderItem.title}. Dette kan ikke angres.`,
                            {
                              title: `Bekreft avbestilling`,
                              okText: "Avbestill",
                              cancelText: "Avbryt",
                              severity: "error",
                            },
                          )
                        ) {
                          cancelOrderItemMutation.mutate({
                            orderId: orderItem.orderId,
                            itemId: orderItem.itemId,
                          });
                        }
                      }}
                    >
                      Avbestill
                    </Button>
                  </Tooltip>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Alert
          icon={<IconInfoCircle />}
          color={"blue"}
          title={
            "Du har ingen aktive bestillinger. Trykk på 'bestill bøker' for å bestille noen."
          }
        />
      )}
      <Box>
        <Button
          leftSection={<IconShoppingCart />}
          onClick={async () => {
            router.push("/order");
          }}
        >
          {(openOrderItems?.length ?? 0) > 0
            ? "Bestill flere"
            : "Bestill bøker"}
        </Button>
      </Box>
    </>
  );
}
