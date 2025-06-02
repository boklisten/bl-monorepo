"use client";

import { Branch } from "@boklisten/backend/shared/branch/branch";
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
import { ReactNode, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import BranchSettingsGeneral from "@/components/branches/BranchSettingsGeneral";
import BranchSettingsSubjects from "@/components/branches/BranchSettingsSubjects";
import UploadClassMemberships from "@/components/branches/UploadClassMemberships";
import useApiClient from "@/utils/api/useApiClient";

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
    mutationFn: async (newBranch: Partial<Branch>) => {
      return await client.v2.branches.$post(newBranch);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [client.$url("collection.branches.getAll", branchQuery)],
      });
      setLoading(false);
    },
    onSuccess: async () => {
      notifications.show("Filial ble opprettet!", {
        severity: "success",
        autoHideDuration: 3000,
      });
      afterSubmit();
    },
    onError: async () => {
      notifications.show("Klarte ikke opprette filial!", {
        severity: "error",
        autoHideDuration: 5000,
      });
    },
  });

  const updateBranchMutation = useMutation({
    mutationFn: async (updatedBranch: Partial<Branch>) => {
      return await client.v2
        .branches({ id: existingBranch?.id ?? "" })
        .$patch(updatedBranch)
        .unwrap();
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [client.$url("collection.branches.getAll", branchQuery)],
      });
      setLoading(false);
    },
    onSuccess: async () => {
      notifications.show("Filial ble oppdatert!", {
        severity: "success",
        autoHideDuration: 3000,
      });
    },
    onError: async () => {
      notifications.show("Klarte ikke oppdatere filial!", {
        severity: "error",
        autoHideDuration: 5000,
      });
    },
  });

  const methods = useForm({
    defaultValues: branchToDefaultValues(existingBranch),
  });
  const [loading, setLoading] = useState(false);

  const { reset, getValues, setValue } = methods;
  useEffect(() => {
    reset(branchToDefaultValues(existingBranch));
  }, [existingBranch, reset, setValue]);

  async function onSubmit() {
    setLoading(true);
    if (existingBranch === null) {
      return addBranchMutation.mutate(getValues());
    }
    updateBranchMutation.mutate(getValues());
  }

  return (
    <FormProvider key={existingBranch?.id ?? "new"} {...methods}>
      <Stack sx={{ position: "relative" }}>
        {existingBranch && (
          <UploadClassMemberships branchId={existingBranch.id} />
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
          onClick={onSubmit}
          loading={loading}
        >
          {existingBranch === null ? "Opprett" : "Lagre"}
        </Button>
      </Stack>
    </FormProvider>
  );
}
