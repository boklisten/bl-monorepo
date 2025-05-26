"use client";

import { Branch } from "@boklisten/backend/shared/branch/branch";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Paper,
  Stack,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import BranchSettingsGeneral from "@/components/branches/BranchSettingsGeneral";
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

export default function BranchSettings({ branch }: { branch: Branch | null }) {
  const queryClient = useQueryClient();
  const branchQuery = {
    query: { sort: "name" },
  };
  const client = useApiClient();
  const methods = useForm({
    defaultValues: branchToDefaultValues(branch),
  });
  const [loading, setLoading] = useState(false);

  const { reset, getValues } = methods;
  useEffect(() => {
    reset(branchToDefaultValues(branch));
  }, [branch, reset]);

  async function onSubmit() {
    setLoading(true);
    const formState = getValues();
    await queryClient.invalidateQueries({
      queryKey: [client.$url("collection.branches.getAll", branchQuery)],
    });
    console.log(formState);
    setLoading(false);
  }

  return (
    <FormProvider {...methods}>
      <Stack sx={{ position: "relative" }}>
        <BranchEditSection title={"Generelt"} defaultExpanded>
          <BranchSettingsGeneral />
        </BranchEditSection>
        <BranchEditSection disabled title={"Bestillinger"}>
          lorem ipsum
        </BranchEditSection>
        <BranchEditSection disabled title={"Åpningstider"}>
          lorem ipsum
        </BranchEditSection>
        <BranchEditSection disabled title={"Fag"}>
          lorem ipsum
        </BranchEditSection>
        <Button
          sx={{ bottom: 0, right: 10, position: "absolute" }}
          variant={"contained"}
          color={"success"}
          onClick={onSubmit}
          loading={loading}
        >
          {branch === null ? "Opprett" : "Lagre"}
        </Button>
      </Stack>
    </FormProvider>
  );
}
