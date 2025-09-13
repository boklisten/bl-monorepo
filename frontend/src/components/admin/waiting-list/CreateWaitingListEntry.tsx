import { Item } from "@boklisten/backend/shared/item";
import { Button, Group, Stack, Title } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { Autocomplete } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import BranchSelect from "@/components/BranchSelect";
import PhoneNumberField from "@/components/user/fields/PhoneNumberField";
import useApiClient from "@/hooks/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/utils/notifications";

interface WaitingListEntryFormFields {
  name: string;
  phoneNumber: string;
}

export default function CreateWaitingListEntry({
  items,
  onClose,
}: {
  items: Item[];
  onClose: () => void;
}) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const [selectedBranchId] = useLocalStorage({ key: "selectedBranchId" });
  const [selectedItems, setSelectedItems] = useState<
    { label: string; id: string }[]
  >([]);
  const { handleSubmit, register, setValue } =
    useForm<WaitingListEntryFormFields>({ mode: "onTouched" });

  const addWaitingListEntryMutation = useMutation({
    mutationFn: async (data: WaitingListEntryFormFields) => {
      for (const item of selectedItems) {
        await client.waiting_list_entries
          .$post({
            customerName: data.name,
            customerPhone: data.phoneNumber,
            branchId: selectedBranchId ?? "",
            itemId: item.id,
          })
          .unwrap();
      }
    },
    onSuccess: () => {
      setValue("name", "");
      setValue("phoneNumber", "");
      setSelectedItems([]);
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

  return (
    <Stack>
      <Title order={2}>Legg til i venteliste</Title>
      <TextField
        id="name"
        required
        fullWidth
        label="Fullt navn"
        {...register("name")}
      />
      <PhoneNumberField {...register("phoneNumber")} />
      <Autocomplete
        value={selectedItems}
        id="itemIds"
        multiple
        options={items.map((item: Item) => ({
          id: item.id,
          label: item.title,
        }))}
        renderInput={(params) => {
          // @ts-expect-error Mui has bad typings
          return <TextField {...params} label="Bøker" />;
        }}
        onChange={(_, selected) => {
          setSelectedItems(selected);
        }}
      />
      <BranchSelect />
      <Group>
        <Button variant={"subtle"} onClick={() => onClose()}>
          Avbryt
        </Button>
        <Button
          loading={addWaitingListEntryMutation.isPending}
          onClick={handleSubmit((data) =>
            addWaitingListEntryMutation.mutate(data),
          )}
        >
          Legg til
        </Button>
      </Group>
    </Stack>
  );
}
