import { Branch } from "@boklisten/backend/shared/branch/branch";
import { School } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import unpack from "@/utils/api/bl-api-request";
import useApiClient from "@/utils/api/useApiClient";

function formatChildLabel(childLabel?: string) {
  if (!childLabel) {
    return "Velg gruppe";
  }
  let modifiedLabel = childLabel;
  if (childLabel.endsWith("er")) {
    modifiedLabel = childLabel.slice(0, -2);
  }
  return `Velg ${modifiedLabel.toLowerCase()}`;
}

function SelectBranchNested({
  allBranches,
  filteredBranches,
  childLabel,
}: {
  allBranches: Branch[];
  filteredBranches: Branch[];
  childLabel: string;
}) {
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    if (filteredBranches.length === 1) {
      setSelectedBranchId(filteredBranches[0]?.id);
    }
  }, [filteredBranches]);

  function getNextStep() {
    const selectedBranch = filteredBranches?.find(
      (branch) => branch.id === selectedBranchId,
    );
    if ((selectedBranch?.childBranches ?? []).length === 0) {
      return null;
    }
    return (
      <SelectBranchNested
        allBranches={allBranches}
        filteredBranches={allBranches.filter((branch) =>
          selectedBranch?.childBranches?.includes(branch.id),
        )}
        childLabel={formatChildLabel(selectedBranch?.childLabel)}
      />
    );
  }

  return (
    <>
      <FormControl fullWidth sx={{ mt: 1 }}>
        <InputLabel>{childLabel}</InputLabel>
        <Select
          required
          label={childLabel}
          value={selectedBranchId ?? ""}
          onChange={(event) => {
            setSelectedBranchId(event.target.value as string);
          }}
        >
          {filteredBranches?.map((branch) => (
            <MenuItem value={branch.id} key={branch.id}>
              {branch.localName ?? branch.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {getNextStep()}
    </>
  );
}

function ClassMembershipSelect({
  branchMembership,
  onChange,
}: {
  branchMembership: string | undefined;
  onChange: (selectedBranchId: string) => void;
}) {
  const client = useApiClient();
  const branchQuery = {
    query: { active: true, sort: "name" },
  };
  const { data: branches } = useQuery({
    queryKey: [client.$url("collection.branches.getAll", branchQuery)],
    queryFn: () =>
      client
        .$route("collection.branches.getAll")
        .$get(branchQuery)
        .then(unpack<Branch[]>),
  });
  const [branchSelectOpen, setBranchSelectOpen] = useState(false);

  return (
    <>
      <Button
        sx={{ mt: 2 }}
        color={"success"}
        startIcon={<School />}
        variant={"contained"}
        onClick={() => setBranchSelectOpen(true)}
      >
        {branchMembership ? "Endre skole" : "Velg skole"}
      </Button>
      <Dialog
        open={branchSelectOpen}
        onClose={() => setBranchSelectOpen(false)}
      >
        <DialogTitle>
          {branchMembership ? "Endre skole" : "Velg skole"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ width: 800 }} />
          <SelectBranchNested
            allBranches={branches ?? []}
            filteredBranches={
              branches?.filter((branch) => !branch.parentBranch) ?? []
            }
            childLabel={"Velg skole"}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBranchSelectOpen(false)}>Avbryt</Button>
          <Button
            onClick={() => {
              // TODO: hook me up to the nested select value
              onChange("TODO");
            }}
          >
            Bekreft
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ClassMembershipSelect;
