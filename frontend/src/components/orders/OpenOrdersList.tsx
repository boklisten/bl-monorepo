"use client";
import { Book } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
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
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useRouter } from "next/navigation";

import { isLoggedIn } from "@/api/auth";
import DynamicLink from "@/components/DynamicLink";
import useApiClient from "@/utils/api/useApiClient";
import useIsHydrated from "@/utils/useIsHydrated";

export default function OpenOrdersList() {
  const hydrated = useIsHydrated();
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

  return (
    hydrated &&
    (isLoggedIn() ? (
      <Stack>
        {(openOrderItems?.length ?? 0) > 0 ? (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tittel</TableCell>
                    <TableCell>Frist</TableCell>
                    {/*
                  <TableCell>Handling</TableCell>
*/}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {openOrderItems?.map((orderItem) => (
                    <TableRow key={orderItem.orderId + orderItem.itemId}>
                      <TableCell>{orderItem.title}</TableCell>
                      <TableCell>
                        {moment(orderItem.deadline).format("DD/MM/YYYY")}
                      </TableCell>
                      {/*
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
                            // mutate
                            console.log("fjern!");
                          }
                        }}
                      >
                        Fjern
                      </Button>
                    </TableCell>
*/}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Alert severity={"info"} sx={{ mt: 3 }}>
              <AlertTitle>Fjerne bestilling?</AlertTitle>
              Ta kontakt på info@boklisten.no dersom du ønsker å fjerne en bok
              fra bestillingen din
            </Alert>
          </>
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
