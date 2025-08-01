"use client";
import { Book } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Tooltip,
} from "@mui/material";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
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
    <Stack>
      {(openOrderItems?.length ?? 0) > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tittel</TableCell>
                <TableCell>Frist</TableCell>
                <TableCell>Handling</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {openOrderItems?.map((orderItem) => (
                <TableRow key={orderItem.orderId + orderItem.itemId}>
                  <TableCell>{orderItem.title}</TableCell>
                  <TableCell>
                    {moment(orderItem.deadline).format("DD/MM/YYYY")}
                  </TableCell>
                  <Tooltip
                    title={
                      orderItem.cancelable
                        ? ""
                        : "Ikke tilgjenglig for øyeblikket. Ta kontakt dersom du ønsker å avbestille"
                    }
                  >
                    <TableCell>
                      <Button
                        disabled={!orderItem.cancelable}
                        color={"error"}
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
                    </TableCell>
                  </Tooltip>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity={"info"}>
          {
            "Du har ingen aktive bestillinger. Trykk på 'bestill bøker' for å bestille noen."
          }
        </Alert>
      )}
      <Box>
        <Button
          sx={{ mt: 2 }}
          startIcon={<Book />}
          variant="contained"
          onClick={async () => {
            router.push("/order");
          }}
        >
          {(openOrderItems?.length ?? 0) > 0
            ? "Bestill flere"
            : "Bestill bøker"}
        </Button>
      </Box>
    </Stack>
  );
}
