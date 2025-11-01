import { Branch } from "@boklisten/backend/shared/branch";
import { Button, Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "@tuyau/client";

import { useAppForm } from "@/shared/hooks/form";
import useApiClient from "@/shared/hooks/useApiClient";
import unpack from "@/shared/utils/bl-api-request";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/shared/utils/notifications";

export default function BranchBaseSettings({
  existingBranch,
  onSuccess,
}: {
  existingBranch?: Branch;
  onSuccess?: (newBranch?: Branch) => void;
}) {
  const queryClient = useQueryClient();
  const client = useApiClient();

  const branchQuery = {
    query: { sort: "name" },
  };
  const { data: branches } = useQuery({
    queryKey: [client.$url("collection.branches.getAll", branchQuery)],
    queryFn: () =>
      client
        .$route("collection.branches.getAll")
        .$get(branchQuery)
        .then(unpack<Branch[]>),
  });

  const branchOptions =
    branches
      ?.filter((branch) => branch.id !== existingBranch?.id)
      .map((branch) => ({
        value: branch.id,
        label: branch.name,
      })) ?? [];

  const addBranchMutation = useMutation({
    mutationFn: (
      newBranch: InferRequestType<typeof client.v2.branches.$post>,
    ) => client.v2.branches.$post(newBranch).unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.$url("collection.branches.getAll", branchQuery)],
      }),
    onSuccess: async (newBranch) => {
      showSuccessNotification("Filial ble opprettet!");
      await queryClient.invalidateQueries({
        queryKey: [client.$url("collection.branches.getAll", branchQuery)],
      });
      onSuccess?.(newBranch);
    },
    onError: () => showErrorNotification("Klarte ikke opprette filial!"),
  });

  const updateBranchMutation = useMutation({
    mutationFn: (
      updatedBranch: InferRequestType<typeof client.v2.branches.$post>,
    ) =>
      client.v2.branches
        .base({ id: existingBranch?.id ?? "" })
        .$patch(updatedBranch)
        .unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.$url("collection.branches.getAll", branchQuery)],
      }),
    onSuccess: () => showSuccessNotification("Filial ble oppdatert!"),
    onError: () => showErrorNotification("Klarte ikke oppdatere filial!"),
  });

  const form = useAppForm({
    defaultValues: {
      name: existingBranch?.name ?? "",
      localName: existingBranch?.localName ?? "",
      parentBranch: existingBranch?.parentBranch ?? "",
      childBranches: existingBranch?.childBranches ?? [],
      childLabel: existingBranch?.childLabel ?? "",
      location: {
        region: existingBranch?.location.region ?? "",
        address: existingBranch?.location.address ?? "",
      },
      type: existingBranch?.type ?? null,
    },
    onSubmit: ({ value }) =>
      !existingBranch
        ? addBranchMutation.mutate(value)
        : updateBranchMutation.mutate(value),
  });

  return (
    <Stack>
      <form.AppField name={"name"}>
        {(field) => (
          <field.TextField
            required
            label={"Fullt navn"}
            placeholder={"Flåklypa videregående skole"}
          />
        )}
      </form.AppField>
      <form.AppField name={"localName"}>
        {(field) => (
          <field.TextField
            required
            label={"Lokalt navn"}
            placeholder={"Flåklypa"}
          />
        )}
      </form.AppField>
      <form.AppField name={"parentBranch"}>
        {(field) => (
          <field.SelectField
            label={"Tilhører"}
            placeholder={"Velg filial"}
            data={branchOptions}
            searchable
            clearable
          />
        )}
      </form.AppField>
      <form.AppField name={"childLabel"}>
        {(field) => (
          <field.TextField
            label={"Delt inn i"}
            placeholder={"årskull, klasse, parallell"}
          />
        )}
      </form.AppField>
      <form.AppField name={"childBranches"}>
        {(field) => (
          <field.MultiSelectField
            label={"Består av"}
            placeholder={"Velg filialer"}
            data={branchOptions}
            searchable
            clearable
          />
        )}
      </form.AppField>
      <form.AppField name={"location.region"}>
        {(field) => (
          <field.TextField
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
        {!existingBranch ? "Opprett" : "Lagre"}
      </Button>
    </Stack>
  );
}
