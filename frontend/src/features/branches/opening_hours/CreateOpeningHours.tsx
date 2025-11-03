import { Button, Stack, Title } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "@tuyau/client";
import dayjs from "dayjs";

import { useAppForm } from "@/shared/hooks/form";
import useApiClient from "@/shared/hooks/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/shared/utils/notifications";

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
      from: "",
      to: "",
    },
    onSubmit: ({ value }) =>
      createOpeningHourMutation.mutate({
        from: value.from,
        to: value.to,
        branchId,
      }),
  });

  return (
    <Stack>
      <Title order={3}>Legg til</Title>
      <form.AppField
        name={"from"}
        validators={{
          onBlur: ({ value }) =>
            !value ? "Du må fylle inn starttidspunkt" : null,
        }}
      >
        {(field) => (
          <field.DateTimePickerField
            required
            minDate={new Date()}
            maxDate={dayjs().add(1, "year").toDate()}
            label={"Fra"}
            placeholder={"Velg starttidspunkt"}
          />
        )}
      </form.AppField>
      <form.AppField
        name={"to"}
        validators={{
          onBlur: ({ value }) =>
            !value ? "Du må fylle inn slutttidspunkt" : null,
        }}
      >
        {(field) => (
          <field.DateTimePickerField
            required
            minDate={new Date()}
            maxDate={dayjs().add(1, "year").toDate()}
            label={"Til"}
            placeholder={"Velg sluttidspunkt"}
          />
        )}
      </form.AppField>
      <form.AppForm>
        <form.ErrorSummary />
      </form.AppForm>
      <Button onClick={form.handleSubmit} bg={"green"}>
        Legg til
      </Button>
    </Stack>
  );
}
