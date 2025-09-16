import { Branch } from "@boklisten/backend/shared/branch";
import { Item } from "@boklisten/backend/shared/item";
import { Button, Group, Stack, Title } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { nameFieldValidator } from "@/shared/components/form/fields/complex/NameField";
import { phoneNumberFieldValidator } from "@/shared/components/form/fields/complex/PhoneNumberField";
import { useAppForm } from "@/shared/hooks/form";
import useApiClient from "@/shared/hooks/useApiClient";
import unpack from "@/shared/utils/bl-api-request";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/shared/utils/notifications";

interface WaitingListEntryForm {
  name: string;
  phoneNumber: string;
  itemIds: string[];
  branchId: string;
}
const defaultValues: WaitingListEntryForm = {
  name: "",
  phoneNumber: "",
  itemIds: [],
  branchId: "",
};

export default function CreateWaitingListEntry({
  items,
  onClose,
}: {
  items: Item[];
  onClose: () => void;
}) {
  const client = useApiClient();
  const queryClient = useQueryClient();

  const branchQuery = {
    query: { active: true, "isBranchItemsLive.online": true, sort: "name" },
  };
  const { data: branches } = useQuery({
    queryKey: [client.$url("collection.branches.getAll", branchQuery)],
    queryFn: () =>
      client
        .$route("collection.branches.getAll")
        .$get(branchQuery)
        .then(unpack<Branch[]>),
  });

  const addWaitingListEntryMutation = useMutation({
    mutationFn: async (data: WaitingListEntryForm) => {
      for (const itemId of data.itemIds) {
        await client.waiting_list_entries
          .$post({
            customerName: data.name,
            customerPhone: data.phoneNumber,
            branchId: data.branchId,
            itemId,
          })
          .unwrap();
      }
    },
    onSuccess: () => {
      showSuccessNotification("Kunden har blitt lagt til i ventelisten");
      onClose();
    },
    onError: () =>
      showErrorNotification("Klarte ikke legge til kunde i venteliste"),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.waiting_list_entries.$url()],
      }),
  });
  const form = useAppForm({
    defaultValues,
    onSubmit: ({ value }) => addWaitingListEntryMutation.mutate(value),
  });

  return (
    <Stack>
      <Title order={2}>Legg til i venteliste</Title>
      <Stack gap={"xl"}>
        <Stack gap={"xs"}>
          <form.AppField
            name={"name"}
            validators={{
              onSubmit: ({ value }) =>
                nameFieldValidator(value, "administrate"),
            }}
          >
            {(field) => <field.NameField autoComplete={"off"} />}
          </form.AppField>
          <form.AppField
            name={"phoneNumber"}
            validators={{
              onSubmit: ({ value }) =>
                phoneNumberFieldValidator(value, "administrate"),
            }}
          >
            {(field) => <field.PhoneNumberField autoComplete={"off"} />}
          </form.AppField>
          <form.AppField
            name={"itemIds"}
            validators={{
              onSubmit: ({ value }) =>
                value.length === 0 ? "Du må velge minst en bok" : null,
            }}
          >
            {(field) => (
              <field.MultiSelectField
                required
                label={"Bøker"}
                placeholder={"Velg bøker"}
                data={items.map((item) => ({
                  value: item.id,
                  label: item.title,
                }))}
                clearable
                searchable
              />
            )}
          </form.AppField>
          <form.AppField
            name={"branchId"}
            validators={{
              onSubmit: ({ value }) =>
                value.length === 0 ? "Du må velge en filial" : null,
            }}
          >
            {(field) => (
              <field.SelectField
                required
                label={"Filial"}
                placeholder={"Velg filial"}
                data={
                  branches?.map((branch) => ({
                    value: branch.id,
                    label: branch.name,
                  })) ?? []
                }
                clearable
                searchable
              />
            )}
          </form.AppField>
          <form.AppForm>
            <form.ErrorSummary />
          </form.AppForm>
        </Stack>
        <Group>
          <Button variant={"subtle"} onClick={() => onClose()}>
            Avbryt
          </Button>
          <Button
            loading={addWaitingListEntryMutation.isPending}
            onClick={form.handleSubmit}
          >
            Legg til
          </Button>
        </Group>
      </Stack>
    </Stack>
  );
}
