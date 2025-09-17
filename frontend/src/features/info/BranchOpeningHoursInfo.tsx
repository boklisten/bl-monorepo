"use client";
import { Branch } from "@boklisten/backend/shared/branch";
import { OpeningHour } from "@boklisten/backend/shared/opening-hour";
import { Skeleton, Stack, Table } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import InfoAlert from "@/shared/components/alerts/InfoAlert";
import ContactInfo from "@/shared/components/ContactInfo";
import unpack from "@/shared/utils/bl-api-request";
import { PLEASE_TRY_AGAIN_TEXT } from "@/shared/utils/constants";
import { publicApiClient } from "@/shared/utils/publicApiClient";

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
  const fromDate = dayjs(openingHour.from).locale("nb");
  const toDate = dayjs(openingHour.to).locale("nb");
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
  const now = dayjs().startOf("day").format("DDMMYYYYHHmm");
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
    return (
      <ErrorAlert title={"Klarte ikke laste inn åpningstider"}>
        {PLEASE_TRY_AGAIN_TEXT}
      </ErrorAlert>
    );
  }

  const processedOpeningHours =
    openingHours
      ?.filter(({ id }) => branch?.openingHours?.includes(id) ?? false)
      .sort(compareOpeningHours) ?? [];

  if (processedOpeningHours.length === 0) {
    return (
      <>
        <InfoAlert
          title={"Sesongen er over – eller åpningstidene er ikke klare enda"}
        >
          Du kan bestille bøker i Posten, eller kontakte oss for spørsmål.
        </InfoAlert>
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
