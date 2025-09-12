"use client";

import { Branch } from "@boklisten/backend/shared/branch";
import { Button, Stack, Title } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import BranchSettingsGeneral from "@/components/branches/BranchSettingsGeneral";
import UploadClassMemberships from "@/components/branches/UploadClassMemberships";
import UploadSubjectChoices from "@/components/branches/UploadSubjectChoices";
import useApiClient from "@/hooks/useApiClient";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/utils/notifications";

function branchToDefaultValues(branch: Branch | null) {
  return {
    name: branch?.name ?? "",
    localName: branch?.localName ?? "",
    parentBranch: branch?.parentBranch ?? "",
    childBranches: branch?.childBranches ?? [],
    childLabel: branch?.childLabel ?? "",
  };
}
export interface BranchCreateForm {
  name: string;
  localName: string;
  parentBranch: string;
  childBranches: string[];
  childLabel: string;
}

export default function BranchSettings({
  existingBranch,
  afterSubmit = () => undefined,
}: {
  existingBranch: Branch | null;
  afterSubmit?: () => void;
}) {
  const queryClient = useQueryClient();
  const branchQuery = {
    query: { sort: "name" },
  };
  const client = useApiClient();
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

  const methods = useForm<BranchCreateForm>({
    defaultValues: branchToDefaultValues(existingBranch),
  });

  const { reset, handleSubmit, setValue } = methods;
  useEffect(() => {
    reset(branchToDefaultValues(existingBranch));
  }, [existingBranch, reset, setValue]);

  return (
    <FormProvider key={existingBranch?.id ?? "new"} {...methods}>
      <Stack>
        <BranchSettingsGeneral currentBranchId={existingBranch?.id ?? null} />
        <Button
          color={"green"}
          onClick={handleSubmit((data) =>
            existingBranch === null
              ? addBranchMutation.mutate(data)
              : updateBranchMutation.mutate(data),
          )}
          loading={
            addBranchMutation.isPending || updateBranchMutation.isPending
          }
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
    </FormProvider>
  );
}
