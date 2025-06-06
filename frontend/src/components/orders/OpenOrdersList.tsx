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
} from "@mui/material";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDialogs, useNotifications } from "@toolpad/core";
import moment from "moment";
import { useRouter } from "next/navigation";

import { isLoggedIn } from "@/api/auth";
import DynamicLink from "@/components/DynamicLink";
import useApiClient from "@/utils/api/useApiClient";
import useIsHydrated from "@/utils/useIsHydrated";

export default function OpenOrdersList() {
  const hydrated = useIsHydrated();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const queryClient = useQueryClient();
  const router = useRouter();
  const client = useApiClient();

  const { data: openOrderItems } = useQuery({
    queryKey: [client.v2.orders.open_orders.$url()],
    queryFn: async () =>
      (await client.v2.orders.open_orders.$get().unwrap()) as {
        orderId: string;
        itemId: string;
        deadline: string;
        title: string;
      }[],
  });

  const cancelOrderItemMutation = useMutation({
    mutationFn: async ({
      orderId,
      itemId,
    }: {
      orderId: string;
      itemId: string;
    }) => {
      return await client.v2.orders.cancel_order_item
        .$post({ orderId, itemId })
        .unwrap();
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [client.v2.orders.open_orders.$url()],
      });
    },
    onSuccess: async () => {
      notifications.show("Bestilling ble oppdatert!", {
        severity: "success",
        autoHideDuration: 3000,
      });
    },
    onError: async () => {
      notifications.show("Klarte ikke fjerne bok fra bestilling!", {
        severity: "error",
        autoHideDuration: 5000,
      });
    },
  });

  return (
    hydrated &&
    (isLoggedIn() ? (
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
                    <TableCell>
                      <Button
                        color={"error"}
                        onClick={async () => {
                          if (
                            await dialogs.confirm(
                              `Du er nå i ferd med å fjerne ${orderItem.title} fra dine bestillinger. Dette kan ikke angres!`,
                              {
                                title: `Bekreft fjerning`,
                                okText: "Fjern",
                                cancelText: "Avbryt",
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
                        Fjern
                      </Button>
                    </TableCell>
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
            onClick={() => {
              router.push("/order");
            }}
          >
            {(openOrderItems?.length ?? 0) > 0
              ? "Bestill flere"
              : "Bestill bøker"}
          </Button>
        </Box>
      </Stack>
    ) : (
      <>
        <Alert severity="info">
          Du må logge inn for å se bestillingene dine
        </Alert>
        <DynamicLink href={"/auth/login?redirect=bestillinger"}>
          <Button variant={"contained"} sx={{ mt: 2 }}>
            Logg inn
          </Button>
        </DynamicLink>
      </>
    ))
  );
}
