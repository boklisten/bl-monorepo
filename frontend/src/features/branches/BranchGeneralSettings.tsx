import { Branch } from "@boklisten/backend/shared/branch";
import { Button, Stack } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "@tuyau/client";

import useUpdateBranchMutation from "@/features/branches/useUpdateBranchMutation";
import { useAppForm } from "@/shared/hooks/form";
import useApiClient from "@/shared/hooks/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/shared/utils/notifications";

export default function BranchGeneralSettings({
  existingBranch,
  onSuccess,
}: {
  existingBranch?: Branch;
  onSuccess?: (newBranch?: Branch) => void;
}) {
  const queryClient = useQueryClient();
  const client = useApiClient();

  const addBranchMutation = useMutation({
    mutationFn: (
      newBranch: InferRequestType<typeof client.v2.branches.$post>,
    ) => client.v2.branches.$post(newBranch).unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [
          client.$url("collection.branches.getAll", {
            query: { sort: "name" },
          }),
        ],
      }),
    onSuccess: async (newBranch) => {
      showSuccessNotification("Filial ble opprettet!");
      await queryClient.invalidateQueries({
        queryKey: [
          client.$url("collection.branches.getAll", {
            query: { sort: "name" },
          }),
        ],
      });
      onSuccess?.(newBranch);
    },
    onError: () => showErrorNotification("Klarte ikke opprette filial!"),
  });
  const updateBranchMutation = useUpdateBranchMutation();

  const form = useAppForm({
    defaultValues: {
      name: existingBranch?.name ?? "",
      location: {
        region: existingBranch?.location.region ?? "",
        address: existingBranch?.location.address ?? "",
      },
      type: existingBranch?.type ?? null,
    },
    onSubmit: ({ value }) =>
      !existingBranch
        ? addBranchMutation.mutate(value)
        : updateBranchMutation.mutate({ id: existingBranch.id, ...value }),
  });

  return (
    <Stack>
      <form.AppField name={"name"}>
        {(field) => (
          <field.TextField
            required
            label={"Navn"}
            placeholder={"Flåklypa videregående skole"}
          />
        )}
      </form.AppField>
      <form.AppField name={"location.region"}>
        {(field) => (
          <field.TextField
            required
            label={"Region"}
            placeholder={"Oslo, Trondheim, Ski"}
          />
        )}
      </form.AppField>
      <form.AppField name={"location.address"}>
        {(field) => (
          <field.TextField
            label={"Adresse"}
            placeholder={"Postboks 8, 1316 Eiksmarka"}
          />
        )}
      </form.AppField>
      <form.AppField name={"type"}>
        {(field) => (
          <field.SelectField
            data={["privatist", "VGS"]}
            label={"Type"}
            placeholder={"privatist eller VGS"}
            clearable
          />
        )}
      </form.AppField>
      <form.AppForm>
        <form.ErrorSummary />
      </form.AppForm>
      <Button
        color={"green"}
        onClick={form.handleSubmit}
        loading={addBranchMutation.isPending || updateBranchMutation.isPending}
      >
        Lagre
      </Button>
    </Stack>
  );
}
