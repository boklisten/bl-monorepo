import { Branch } from "@boklisten/backend/shared/branch";
import { Button, Stack, Title } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import UploadClassMemberships from "@/components/branches/UploadClassMemberships";
import UploadSubjectChoices from "@/components/branches/UploadSubjectChoices";
import { useAppForm } from "@/hooks/form";
import useApiClient from "@/hooks/useApiClient";
import unpack from "@/utils/bl-api-request";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/utils/notifications";

export default function BranchSettings({
  existingBranch,
  afterSubmit = () => undefined,
}: {
  existingBranch: Branch | null;
  afterSubmit?: () => void;
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

  const addBranchMutation = useMutation({
    mutationFn: (newBranch: Partial<Branch>) =>
      client.v2.branches.$post(newBranch).unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.$url("collection.branches.getAll", branchQuery)],
      }),
    onSuccess: () => {
      showSuccessNotification("Filial ble opprettet!");
      afterSubmit();
    },
    onError: () => showErrorNotification("Klarte ikke opprette filial!"),
  });

  const updateBranchMutation = useMutation({
    mutationFn: (updatedBranch: Partial<Branch>) =>
      client.v2
        .branches({ id: existingBranch?.id ?? "" })
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
    },
    onSubmit: ({ value }) =>
      existingBranch === null
        ? addBranchMutation.mutate(value)
        : updateBranchMutation.mutate(value),
  });

  const branchOptions =
    branches
      ?.filter((branch) => branch.id !== existingBranch?.id)
      .map((branch) => ({
        value: branch.id,
        label: branch.name,
      })) ?? [];

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
            required
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
            required
            label={"Delt inn i"}
            placeholder={"årskull, klasse, parallell"}
          />
        )}
      </form.AppField>
      <form.AppField name={"childBranches"}>
        {(field) => (
          <field.MultiSelectField
            required
            label={"Består av"}
            placeholder={"Velg filialer"}
            data={branchOptions}
            searchable
            clearable
          />
        )}
      </form.AppField>
      <Button
        color={"green"}
        onClick={form.handleSubmit}
        loading={addBranchMutation.isPending || updateBranchMutation.isPending}
      >
        {existingBranch === null ? "Opprett" : "Lagre"}
      </Button>
      {existingBranch && (
        <Stack gap={"xs"}>
          <Title order={2}>Last opp informasjon</Title>
          <UploadClassMemberships branchId={existingBranch.id} />
          <UploadSubjectChoices branchId={existingBranch.id} />
        </Stack>
      )}
    </Stack>
  );
}
