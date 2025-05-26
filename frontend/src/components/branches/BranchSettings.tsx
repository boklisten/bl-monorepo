"use client";

import { Branch } from "@boklisten/backend/shared/branch/branch";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { ReactNode } from "react";

import BranchSettingsGeneral from "@/components/branches/BranchSettingsGeneral";

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

export default function BranchSettings({ branch }: { branch: Branch }) {
  return (
    <Stack sx={{ flexGrow: 1 }}>
      <Typography variant={"h1"}>Rediger filial</Typography>
      <BranchEditSection title={"Generelt"} defaultExpanded>
        <BranchSettingsGeneral branch={branch} />
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
    </Stack>
  );
}
