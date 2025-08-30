"use client";
import { Branch } from "@boklisten/backend/shared/branch";
import { OpeningHour } from "@boklisten/backend/shared/opening-hour";
import { Alert, Skeleton, Stack, Table } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";

import ContactInfo from "@/components/info/ContactInfo";
import unpack from "@/utils/api/bl-api-request";
import { publicApiClient } from "@/utils/api/publicApiClient";
import "moment/locale/nb";

const compareOpeningHours = (a: OpeningHour, b: OpeningHour): number => {
  if (a.from < b.from) {
    return -1;
  }
  if (a.from > b.from) {
    return 1;
  }
  return 0;
};

const OpeningHourRow = ({ openingHour }: { openingHour: OpeningHour }) => {
  const fromDate = moment(openingHour.from).locale("nb");
  const toDate = moment(openingHour.to).locale("nb");
  const weekday = fromDate.format("dddd");
  const date = fromDate.format("DD.MM.YYYY");
  const fromTime = fromDate.format("HH:mm");
  const toTime = toDate.format("HH:mm");
  const capitalize = (s: string) =>
    s.length > 0 && s[0]?.toUpperCase() + s.slice(1);
  return (
    <Table.Tr key={openingHour.id}>
      <Table.Td>
        {capitalize(weekday)} {date}
      </Table.Td>
      <Table.Td>{fromTime}</Table.Td>
      <Table.Td>{toTime}</Table.Td>
    </Table.Tr>
  );
};

export default function BranchOpeningHours({ branchId }: { branchId: string }) {
  const now = moment().startOf("day").format("DDMMYYYYHHmm");
  const {
    data: branch,
    isLoading: isLoadingBranch,
    isError: isErrorBranch,
  } = useQuery({
    queryKey: [
      publicApiClient.$url("collection.branches.getId", {
        params: {
          id: branchId,
        },
      }),
    ],
    queryFn: async () => {
      const response = await publicApiClient
        .$route("collection.branches.getId", {
          id: branchId,
        })
        .$get();
      return unpack<[Branch]>(response)[0];
    },
  });

  const {
    data: openingHours,
    isLoading: isLoadingOpeningHours,
    isError: isErrorOpeningHours,
  } = useQuery({
    queryKey: [
      publicApiClient.$url("collection.openinghours.getAll", {
        query: {
          branch: branchId,
          from: ">" + now,
        },
      }),
    ],
    queryFn: async () => {
      const response = await publicApiClient
        .$route("collection.openinghours.getAll")
        .$get({
          query: {
            branch: branchId,
            from: ">" + now,
          },
        });
      return unpack<OpeningHour[]>(response) ?? [];
    },
  });

  if (isLoadingBranch || isLoadingOpeningHours) {
    return (
      <Stack w={"100%"} mt={"md"}>
        <Skeleton height={25} />
        <Skeleton height={25} />
        <Skeleton height={25} />
        <Skeleton height={25} />
        <Skeleton height={25} />
      </Stack>
    );
  }

  if (isErrorBranch || isErrorOpeningHours) {
    return <Alert color={"red"} title={"Klarte ikke laste inn åpningstider"} />;
  }

  const processedOpeningHours =
    openingHours
      ?.filter(({ id }) => branch?.openingHours?.includes(id) ?? false)
      .sort(compareOpeningHours) ?? [];

  if (processedOpeningHours.length === 0) {
    return (
      <>
        <Alert color={"blue"}>
          Sesongen er over – eller åpningstidene er ikke klare enda. Du kan
          bestille bøker i Posten, eller kontakte oss for spørsmål.
        </Alert>
        <ContactInfo />
      </>
    );
  }

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Dato</Table.Th>
          <Table.Th>Fra</Table.Th>
          <Table.Th>Til</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {processedOpeningHours.map((openingHour) => (
          <OpeningHourRow key={openingHour.id} openingHour={openingHour} />
        ))}
      </Table.Tbody>
    </Table>
  );
}
