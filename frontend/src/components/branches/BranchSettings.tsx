"use client";

import { Branch } from "@boklisten/backend/shared/branch";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Paper,
  Stack,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@toolpad/core";
import { ReactNode, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import BranchSettingsGeneral from "@/components/branches/BranchSettingsGeneral";
import BranchSettingsSubjects from "@/components/branches/BranchSettingsSubjects";
import UploadClassMemberships from "@/components/branches/UploadClassMemberships";
import UploadSubjectChoices from "@/components/branches/UploadSubjectChoices";
import useApiClient from "@/hooks/useApiClient";
import {
  ERROR_NOTIFICATION,
  SUCCESS_NOTIFICATION,
} from "@/utils/notifications";

function BranchEditSection({
  title,
  disabled = false,
  defaultExpanded = false,
  children,
}: {
  title: string;
  disabled?: boolean;
  defaultExpanded?: boolean;
  children: ReactNode;
}) {
  return (
    <Accordion
      slots={{ root: Paper }}
      disabled={disabled}
      defaultExpanded={defaultExpanded}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        {title}
      </AccordionSummary>
      <AccordionDetails>
        <Stack gap={2}>{children}</Stack>
      </AccordionDetails>
    </Accordion>
  );
}

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
  const notifications = useNotifications();
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
      notifications.show("Filial ble opprettet!", SUCCESS_NOTIFICATION);
      afterSubmit();
    },
    onError: () =>
      notifications.show("Klarte ikke opprette filial!", ERROR_NOTIFICATION),
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
    onSuccess: () =>
      notifications.show("Filial ble oppdatert!", SUCCESS_NOTIFICATION),
    onError: () =>
      notifications.show("Klarte ikke oppdatere filial!", ERROR_NOTIFICATION),
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
      <Stack sx={{ position: "relative" }}>
        {existingBranch && (
          <>
            <UploadClassMemberships branchId={existingBranch.id} />
            <UploadSubjectChoices branchId={existingBranch.id} />
          </>
        )}
        <BranchEditSection title={"Generelt"} defaultExpanded>
          <BranchSettingsGeneral currentBranchId={existingBranch?.id ?? null} />
        </BranchEditSection>
        <BranchEditSection disabled title={"Bestillinger"}>
          lorem ipsum
        </BranchEditSection>
        <BranchEditSection disabled title={"Åpningstider"}>
          lorem ipsum
        </BranchEditSection>
        <BranchEditSection disabled={!existingBranch?.id} title={"Fag"}>
          {existingBranch && (
            <BranchSettingsSubjects branchId={existingBranch.id} />
          )}
        </BranchEditSection>
        <Box sx={{ height: 50 }} />
        <Button
          sx={{ bottom: 0, right: 10, position: "absolute" }}
          variant={"contained"}
          color={"success"}
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
      </Stack>
    </FormProvider>
  );
}
