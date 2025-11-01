import { Branch } from "@boklisten/backend/shared/branch";
import { Button, Stack, Title } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import UploadClassMemberships from "@/features/branches/UploadClassMemberships";
import UploadSubjectChoices from "@/features/branches/UploadSubjectChoices";
import { useAppForm } from "@/shared/hooks/form";
import useApiClient from "@/shared/hooks/useApiClient";
import unpack from "@/shared/utils/bl-api-request";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/shared/utils/notifications";

type DetailedBranch = Omit<Branch, "id"> & {
  active: boolean;
  isBranchItemsLive: {
    online: boolean;
    atBranch: boolean;
  };
};

export default function BranchSettings({
  existingBranch,
  onSuccess = () => undefined,
}: {
  existingBranch: Branch | null;
  onSuccess?: () => void;
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
    mutationFn: (newBranch: DetailedBranch) =>
      client.v2.branches.$post(newBranch).unwrap(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [client.$url("collection.branches.getAll", branchQuery)],
      }),
    onSuccess: async () => {
      showSuccessNotification("Filial ble opprettet!");
      await queryClient.invalidateQueries({
        queryKey: [client.$url("collection.branches.getAll", branchQuery)],
      });
      onSuccess();
    },
    onError: () => showErrorNotification("Klarte ikke opprette filial!"),
  });

  const updateBranchMutation = useMutation({
    mutationFn: (updatedBranch: DetailedBranch) =>
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

  const defaultValues: DetailedBranch = {
    name: existingBranch?.name ?? "",
    localName: existingBranch?.localName ?? "",
    parentBranch: existingBranch?.parentBranch ?? "",
    childBranches: existingBranch?.childBranches ?? [],
    childLabel: existingBranch?.childLabel ?? "",
    location: existingBranch?.location ?? {
      region: "",
      address: "",
    },
    type: existingBranch?.type,
    active: existingBranch?.active ?? false,
    isBranchItemsLive: {
      online: existingBranch?.isBranchItemsLive?.online ?? false,
      atBranch: existingBranch?.isBranchItemsLive?.atBranch ?? false,
    },
  };

  const form = useAppForm({
    defaultValues,
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
      <form.AppField name={"active"}>
        {(field) => <field.SwitchField label={"Aktiv"} />}
      </form.AppField>
      <form.AppField name={"isBranchItemsLive.online"}>
        {(field) => <field.SwitchField label={"Synlig for kunder"} />}
      </form.AppField>
      <form.AppField name={"isBranchItemsLive.atBranch"}>
        {(field) => <field.SwitchField label={"Synlig for ansatte"} />}
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
