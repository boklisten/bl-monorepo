import { Item } from "@boklisten/backend/shared/item";
import { useLocalStorage } from "@mantine/hooks";
import {
  Autocomplete,
  Button,
  Collapse,
  Grid,
  Typography,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import BranchSelect from "@/components/BranchSelect";
import ErrorAlert from "@/components/ui/alerts/ErrorAlert";
import SuccessAlert from "@/components/ui/alerts/SuccessAlert";
import PhoneNumberField from "@/components/user/fields/PhoneNumberField";
import useApiClient from "@/hooks/useApiClient";
import { PLEASE_TRY_AGAIN_TEXT } from "@/utils/constants";

interface WaitingListEntryFormFields {
  name: string;
  phoneNumber: string;
}

export default function CreateWaitingListEntry({ items }: { items: Item[] }) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const [selectedBranchId] = useLocalStorage({ key: "selectedBranchId" });
  const [selectedItems, setSelectedItems] = useState<
    { label: string; id: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | undefined>();
  const { handleSubmit, register, setValue } =
    useForm<WaitingListEntryFormFields>({ mode: "onTouched" });

  const onSubmitValid: SubmitHandler<WaitingListEntryFormFields> = async (
    data,
  ) => {
    setStatus(undefined);
    setIsSubmitting(true);
    try {
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
      setValue("name", "");
      setValue("phoneNumber", "");
      setSelectedItems([]);
      setStatus("success");
    } catch (error: unknown) {
      console.error(error);
      setStatus("error");
    }
    await queryClient.invalidateQueries({
      queryKey: [client.waiting_list_entries.$url()],
    });
    setIsSubmitting(false);
    setTimeout(() => {
      setStatus(undefined);
    }, 4000);
  };

  return (
    <Grid
      container
      spacing={2}
      direction="column"
      width={400}
      onSubmit={handleSubmit(onSubmitValid)}
    >
      <Typography
        variant="h1"
        sx={{
          mb: 2,
        }}
      >
        Legg til i venteliste
      </Typography>
      <Grid>
        <TextField
          id="name"
          required
          fullWidth
          label="Fullt navn"
          {...register("name")}
        />
      </Grid>
      <Grid>
        <PhoneNumberField {...register("phoneNumber")} />
      </Grid>
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
      <Collapse in={status !== undefined}>
        <>
          {status === "error" && (
            <ErrorAlert title={"Klarte ikke legge til kunde i venteliste"}>
              {PLEASE_TRY_AGAIN_TEXT}
            </ErrorAlert>
          )}
          {status === "success" && (
            <SuccessAlert>Kunden har blitt lagt til i ventelisten</SuccessAlert>
          )}
        </>
      </Collapse>
      <Button
        loading={isSubmitting}
        type="submit"
        variant="contained"
        onClick={handleSubmit(onSubmitValid)}
      >
        Legg til
      </Button>
    </Grid>
  );
}
