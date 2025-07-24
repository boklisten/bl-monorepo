"use client";

import { Alert, Box, Skeleton, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { ReactNode } from "react";

import CustomerItemCard from "@/components/items/CustomerItemCard";
import OpenOrdersList from "@/components/orders/OpenOrdersList";
import useApiClient from "@/utils/api/useApiClient";

function CustomerItemsOverviewWrapper({
  orderedItemsSlot,
  activeItemsSlot,
  inactiveItemsSlot,
}: {
  orderedItemsSlot: ReactNode;
  activeItemsSlot: ReactNode;
  inactiveItemsSlot: ReactNode;
}) {
  return (
    <Stack gap={1}>
      <Typography variant={"h2"}>Bestilte bøker</Typography>
      {orderedItemsSlot}
      <Stack>
        <Typography variant={"h2"}>Aktive bøker</Typography>
        <Typography
          variant={"subtitle2"}
          sx={{ fontWeight: "light", fontStyle: "italic" }}
        >
          Dette er bøkene du for øyeblikket er ansvarlig for. Du får beskjed om
          hvordan de skal leveres når fristen nærmer seg.
        </Typography>
      </Stack>
      {activeItemsSlot}
      <Stack>
        <Typography variant={"h2"}>Tidligere bøker</Typography>
        <Typography
          variant={"subtitle2"}
          sx={{ fontWeight: "light", fontStyle: "italic" }}
        >
          Dette er bøker som du har returnert eller kjøpt ut. Du trenger ikke
          bekymre deg for dem lenger.
        </Typography>
      </Stack>
      {inactiveItemsSlot}
    </Stack>
  );
}

export default function CustomerItemsOverview() {
  const client = useApiClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: [client.v2.customer_items.$url()],
    queryFn: () => client.v2.customer_items.$get().unwrap(),
  });

  const {
    data: openOrderItems,
    isLoading: isLoadingOpenOrderItems,
    isError: isErrorOpenOrderItems,
  } = useQuery({
    queryKey: [client.v2.orders.open_orders.$url()],
    queryFn: async () =>
      (await client.v2.orders.open_orders.$get().unwrap()) as {
        orderId: string;
        itemId: string;
        deadline: string;
        title: string;
      }[],
  });

  if (isLoading || isLoadingOpenOrderItems) {
    return (
      <CustomerItemsOverviewWrapper
        orderedItemsSlot={
          <Box>
            <Skeleton height={60} />
          </Box>
        }
        activeItemsSlot={
          <Stack>
            <Skeleton height={200} />
            <Skeleton height={200} />
            <Skeleton height={200} />
          </Stack>
        }
        inactiveItemsSlot={
          <Stack>
            <Skeleton height={200} />
            <Skeleton height={200} />
            <Skeleton height={200} />
          </Stack>
        }
      />
    );
  }

  if (!data || isError || !openOrderItems || isErrorOpenOrderItems) {
    return (
      <Alert severity={"error"}>
        Dette skjedde noe galt under innlastingen av dine bøker. Vennligst prøv
        igjen eller ta kontakt hvis problemet vedvarer
      </Alert>
    );
  }

  const inactiveItems = data.filter((ci) =>
    ["returned", "buyout"].includes(ci.status.type),
  );
  const activeItems = data.filter((ci) =>
    ["active", "overdue"].includes(ci.status.type),
  );

  return (
    <CustomerItemsOverviewWrapper
      orderedItemsSlot={<OpenOrdersList openOrderItems={openOrderItems} />}
      activeItemsSlot={
        <>
          {activeItems.length > 0 ? (
            activeItems.map((actionableCustomerItem) => (
              <CustomerItemCard
                key={actionableCustomerItem.id}
                actionableCustomerItem={actionableCustomerItem}
              />
            ))
          ) : (
            <Alert severity={"info"}>
              Du har for øyeblikket ingen aktive bøker.
            </Alert>
          )}
        </>
      }
      inactiveItemsSlot={
        <>
          {inactiveItems.length > 0 ? (
            inactiveItems.map((actionableCustomerItem) => (
              <CustomerItemCard
                key={actionableCustomerItem.id}
                actionableCustomerItem={actionableCustomerItem}
              />
            ))
          ) : (
            <Alert severity={"info"}>
              Du har ikke levert inn eller kjøpt ut noen bøker enda.
            </Alert>
          )}
        </>
      }
    />
  );
}
