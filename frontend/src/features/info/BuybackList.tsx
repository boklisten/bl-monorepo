"use client";
import { Item } from "@boklisten/backend/shared/item";
import { Table, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "react";

import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import InfoAlert from "@/shared/components/alerts/InfoAlert";
import useApiClient from "@/shared/hooks/useApiClient";
import unpack from "@/shared/utils/bl-api-request";
import {
  GENERIC_ERROR_TEXT,
  PLEASE_TRY_AGAIN_TEXT,
} from "@/shared/utils/constants";

const BuybackList = ({
  cachedBuybackItems,
}: {
  cachedBuybackItems: Item[];
}) => {
  const client = useApiClient();

  const { data, error } = useQuery({
    queryKey: [
      client.$url("collection.items.getAll", {
        query: { buyback: true, sort: "title" },
      }),
    ],
    queryFn: () =>
      client
        .$route("collection.items.getAll")
        .$get({
          query: { buyback: true, sort: "title" },
        })
        .then(unpack<Item[]>),
  });
  const items = data ?? cachedBuybackItems;
  return (
    <>
      <Title>Innkjøpsliste</Title>
      <Text>
        Dette er listen over bøkene vi kjøper inn. Vær oppmerksom på at denne
        listen kan endre seg fortløpende. Vi tar forbehold for eventuelle feil i
        innkjøpslisten!
      </Text>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tittel</Table.Th>
            <Table.Th>ISBN</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Activity mode={!error ? "visible" : "hidden"}>
            {items.map((item) => (
              <Table.Tr key={item.info.isbn}>
                <Table.Td>{item.title}</Table.Td>
                <Table.Td>{item.info.isbn}</Table.Td>
              </Table.Tr>
            ))}
          </Activity>
        </Table.Tbody>
      </Table>
      <Activity mode={!error && items.length === 0 ? "visible" : "hidden"}>
        <InfoAlert>
          Ingen bøker i listen. Kom tilbake senere for å se en oppdatert liste.
        </InfoAlert>
      </Activity>
      <Activity mode={error ? "visible" : "hidden"}>
        <ErrorAlert title={GENERIC_ERROR_TEXT}>
          {PLEASE_TRY_AGAIN_TEXT}
        </ErrorAlert>
      </Activity>
    </>
  );
};

export default BuybackList;
