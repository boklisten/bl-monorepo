import { Button, Group, Stack } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "@tuyau/client";
import dayjs from "dayjs";

import { useAppForm } from "@/shared/hooks/form";
import useApiClient from "@/shared/hooks/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/shared/utils/notifications";

function combineDateAndTime(date: string, time: string) {
  return dayjs(`${date}T${time}`).toISOString();
}

export default function CreateOpeningHours({ branchId }: { branchId: string }) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const createOpeningHourMutation = useMutation({
    mutationFn: (
      data: InferRequestType<typeof client.v2.opening_hours.$post>,
    ) => client.v2.opening_hours.$post(data).unwrap(),
    onError: () => showErrorNotification("Klarte ikke legg til åpningstid"),
    onSuccess: () => {
      showSuccessNotification("Åpningstid ble lagt til!");
      form.reset();
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.v2.opening_hours({ id: branchId }).$url(), branchId],
      }),
  });
  const form = useAppForm({
    defaultValues: {
      date: "",
      start: "",
      end: "",
    },
    onSubmit: ({ value }) =>
      createOpeningHourMutation.mutate({
        from: combineDateAndTime(value.date, value.start),
        to: combineDateAndTime(value.date, value.end),
        branchId,
      }),
  });

  return (
    <Stack>
      <Group align={"start"}>
        <form.AppField
          name={"date"}
          validators={{
            onBlur: ({ value }) => (!value ? "Du må fylle inn dato" : null),
          }}
        >
          {(field) => (
            <field.DateField
              required
              minDate={new Date()}
              maxDate={dayjs().add(1, "year").toDate()}
              label={"Dato"}
              placeholder={"Velg dato"}
            />
          )}
        </form.AppField>
        <form.AppField
          name={"start"}
          validators={{
            onBlur: ({ value }) =>
              !value ? "Du må fylle inn starttidspunkt" : null,
          }}
        >
          {(field) => <field.TimePickerField required label={"Fra"} />}
        </form.AppField>
        <form.AppField
          name={"end"}
          validators={{
            onBlur: ({ value }) =>
              !value ? "Du må fylle inn slutttidspunkt" : null,
          }}
        >
          {(field) => <field.TimePickerField required label={"Til"} />}
        </form.AppField>
      </Group>
      <form.AppForm>
        <form.ErrorSummary />
      </form.AppForm>
      <Group>
        <Button onClick={form.handleSubmit} bg={"green"}>
          Legg til
        </Button>
      </Group>
    </Stack>
  );
}
