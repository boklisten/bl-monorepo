"use client";

import { Accordion, Alert, Skeleton, Stack, Text, Title } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { ReactNode } from "react";

import CustomerItemCard from "@/components/items/CustomerItemCard";
import OpenOrdersList from "@/components/orders/OpenOrdersList";
import useApiClient from "@/hooks/useApiClient";

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
    <>
      <Stack gap={"xs"}>
        <Title order={2} mt={"md"}>
          Bestilte bøker
        </Title>
        {orderedItemsSlot}
      </Stack>

      <Stack gap={"xs"}>
        <Title order={2}>Aktive bøker</Title>
        <Text fw={"light"} fs={"italic"}>
          Dette er bøkene du for øyeblikket er ansvarlig for. Du får beskjed om
          hvordan de skal leveres når fristen nærmer seg.
        </Text>
        {activeItemsSlot}
      </Stack>

      <Accordion>
        <Accordion.Item value={"prev-items"}>
          <Accordion.Control>
            <Title order={2}>Tidligere bøker</Title>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack>{inactiveItemsSlot}</Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </>
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
    queryFn: () => client.v2.orders.open_orders.$get().unwrap(),
  });

  if (isLoading || isLoadingOpenOrderItems) {
    return (
      <CustomerItemsOverviewWrapper
        orderedItemsSlot={
          <>
            <Skeleton height={50} />
            <Skeleton height={50} width={150} />
          </>
        }
        activeItemsSlot={
          <>
            <Skeleton height={250} />
            <Skeleton height={250} />
            <Skeleton height={250} />
          </>
        }
        inactiveItemsSlot={
          <>
            <Skeleton height={250} />
            <Skeleton height={250} />
            <Skeleton height={250} />
          </>
        }
      />
    );
  }

  if (!data || isError || !openOrderItems || isErrorOpenOrderItems) {
    return (
      <Alert
        color={"red"}
        title={
          "Dette skjedde noe galt under innlastingen av dine bøker. Vennligst prøv igjen eller ta kontakt hvis problemet vedvarer"
        }
      />
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
            <Alert
              icon={<IconInfoCircle />}
              color={"blue"}
              title={"Du har for øyeblikket ingen aktive bøker."}
            />
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
            <Alert
              icon={<IconInfoCircle />}
              color={"blue"}
              title={"Du har ikke levert inn eller kjøpt ut noen bøker enda."}
            />
          )}
        </>
      }
    />
  );
}
