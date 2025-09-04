"use client";
import { Item } from "@boklisten/backend/shared/item";
import { Alert, Table, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import useApiClient from "@/hooks/useApiClient";
import unpack from "@/utils/bl-api-request";

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
          {!error &&
            items.map((item) => (
              <Table.Tr key={item.info.isbn}>
                <Table.Td>{item.title}</Table.Td>
                <Table.Td>{item.info.isbn}</Table.Td>
              </Table.Tr>
            ))}
        </Table.Tbody>
      </Table>
      {!error && items.length === 0 && (
        <Alert color={"blue"}>
          Ingen bøker i listen. Kom tilbake senere for å se en oppdatert liste.
        </Alert>
      )}
      {error && (
        <Alert color={"red"}>Noe gikk galt! Vennligst prøv igjen senere.</Alert>
      )}
    </>
  );
};

export default BuybackList;
