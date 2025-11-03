import { OpeningHour } from "@boklisten/backend/shared/opening-hour";
import { Button, Skeleton, Stack, Table } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

import ErrorAlert from "@/shared/components/alerts/ErrorAlert";
import InfoAlert from "@/shared/components/alerts/InfoAlert";
import useApiClient from "@/shared/hooks/useApiClient";
import { PLEASE_TRY_AGAIN_TEXT } from "@/shared/utils/constants";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/shared/utils/notifications";
import { publicApiClient } from "@/shared/utils/publicApiClient";

const OpeningHourRow = ({ openingHour }: { openingHour: OpeningHour }) => {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const deleteOpeningHourMutation = useMutation({
    mutationFn: () =>
      client.v2.opening_hours({ id: openingHour.id }).$delete().unwrap(),
    onError: () => showErrorNotification("Klarte ikke slette åpningstid"),
    onSuccess: () => {
      showSuccessNotification("Åpningstid ble slettet!");
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [
          client.v2.opening_hours({ id: openingHour.branch }).$url(),
          openingHour.branch,
        ],
      }),
  });
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
      <Table.Td>
        <Button bg={"red"} onClick={() => deleteOpeningHourMutation.mutate()}>
          Slett
        </Button>
      </Table.Td>
    </Table.Tr>
  );
};

export default function OpeningHoursList({ branchId }: { branchId: string }) {
  const {
    data: openingHours,
    isLoading: isLoadingOpeningHours,
    isError: isErrorOpeningHours,
  } = useQuery({
    queryKey: [
      publicApiClient.v2.opening_hours({ id: branchId }).$url(),
      branchId,
    ],
    queryFn: () =>
      publicApiClient.v2.opening_hours({ id: branchId }).$get().unwrap(),
  });

  if (isLoadingOpeningHours) {
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

  if (isErrorOpeningHours || openingHours == undefined) {
    return (
      <ErrorAlert title={"Klarte ikke laste inn åpningstider"}>
        {PLEASE_TRY_AGAIN_TEXT}
      </ErrorAlert>
    );
  }

  if (openingHours.length === 0) {
    return (
      <>
        <InfoAlert title={"Ingen fremtidige åpningstider"}>
          Denne filialen har ingen fremtidige åpningstider.
        </InfoAlert>
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
          <Table.Th>Handling</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {openingHours.map((openingHour) => (
          <OpeningHourRow key={openingHour.id} openingHour={openingHour} />
        ))}
      </Table.Tbody>
    </Table>
  );
}
