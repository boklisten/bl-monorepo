"use client";
import { Item } from "@boklisten/backend/shared/item";
import { Table, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import ErrorAlert from "@/components/ui/alerts/ErrorAlert";
import InfoAlert from "@/components/ui/alerts/InfoAlert";
import useApiClient from "@/hooks/useApiClient";
import unpack from "@/utils/bl-api-request";
import { GENERIC_ERROR_TEXT, PLEASE_TRY_AGAIN_TEXT } from "@/utils/constants";

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
        <InfoAlert>
          Ingen bøker i listen. Kom tilbake senere for å se en oppdatert liste.
        </InfoAlert>
      )}
      {error && (
        <ErrorAlert title={GENERIC_ERROR_TEXT}>
          {PLEASE_TRY_AGAIN_TEXT}
        </ErrorAlert>
      )}
    </>
  );
};

export default BuybackList;
