import { Branch } from "@boklisten/backend/shared/branch";
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
  Stack,
} from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import unpack from "@/utils/api/bl-api-request";
import useApiClient from "@/utils/api/useApiClient";

function formatChildLabel(childLabel?: string) {
  if (!childLabel) {
    return "Velg";
  }
  return `Velg ${childLabel.toLowerCase()}`;
}

function SelectBranchNested({
  branchMembershipTree,
  allBranches,
  filteredBranches,
  childLabel,
  onSelect,
}: {
  branchMembershipTree: string[] | null;
  allBranches: Branch[];
  filteredBranches: Branch[];
  childLabel: string;
  onSelect: (selectedBranchId: string | null) => void;
}) {
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(
    branchMembershipTree?.[0] || undefined,
  );

  useEffect(() => {
    if (filteredBranches.length === 1) {
      setSelectedBranchId(filteredBranches[0]?.id);
    }
  }, [filteredBranches]);

  useEffect(() => {
    const branch = filteredBranches.find((b) => b.id === selectedBranchId);
    if ((branch?.childBranches ?? []).length === 0) {
      onSelect(selectedBranchId ?? null);
    }
  }, [selectedBranchId, filteredBranches, onSelect]);

  function getNextStep() {
    const selectedBranch = filteredBranches?.find(
      (branch) => branch.id === selectedBranchId,
    );
    if ((selectedBranch?.childBranches ?? []).length === 0) {
      return null;
    }
    return (
      <SelectBranchNested
        branchMembershipTree={branchMembershipTree?.slice(1) || null}
        allBranches={allBranches}
        filteredBranches={allBranches.filter((branch) =>
          selectedBranch?.childBranches?.includes(branch.id),
        )}
        childLabel={formatChildLabel(selectedBranch?.childLabel)}
        onSelect={onSelect}
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
  error,
}: {
  branchMembership: string | undefined;
  onChange: (selectedBranchId: string | null) => void;
  error: boolean;
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
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(
    branchMembership ?? null,
  );
  const [branchSelectOpen, setBranchSelectOpen] = useState(false);

  function calculateBranchMembershipTree(): string[] | null {
    if (!branchMembership) return null;
    const branchMembershipTree: string[] = [branchMembership];
    while (true) {
      const currentBranch = branches?.find(
        (branch) => branch.id === branchMembershipTree.at(-1),
      );
      const parent = branches?.find(
        (branch) => branch.id === currentBranch?.parentBranch,
      );
      if (parent) branchMembershipTree.push(parent?.id);

      if (!parent?.parentBranch) {
        break;
      }
    }
    return branchMembershipTree.reverse();
  }

  const selectedBranchName = branches?.find(
    (branch) => branch.id === branchMembership,
  )?.name;

  return (
    <>
      <TextField
        error={error}
        label={"Velg skole"}
        fullWidth
        select
        value={selectedBranchId ?? ""}
        slotProps={{ input: { readOnly: true } }}
        onClick={() => {
          setBranchSelectOpen(true);
        }}
      >
        <MenuItem value={selectedBranchId ?? ""}>{selectedBranchName}</MenuItem>
      </TextField>
      <Dialog
        open={branchSelectOpen}
        onClose={() => setBranchSelectOpen(false)}
      >
        <DialogTitle>
          {branchMembership ? "Endre skole" : "Velg skole"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ width: 800 }} />
          <Stack gap={1}>
            <SelectBranchNested
              branchMembershipTree={calculateBranchMembershipTree()}
              allBranches={branches ?? []}
              filteredBranches={
                branches?.filter((branch) => !branch.parentBranch) ?? []
              }
              childLabel={"Velg skole"}
              onSelect={(selected) => setSelectedBranchId(selected)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBranchSelectOpen(false)}>Avbryt</Button>
          <Button
            disabled={!selectedBranchId}
            onClick={() => {
              onChange(selectedBranchId);
              setBranchSelectOpen(false);
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
