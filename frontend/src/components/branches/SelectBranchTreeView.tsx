import { Branch } from "@boklisten/backend/shared/branch/branch";
import { Stack, Typography } from "@mui/material";
import { TreeItem } from "@mui/x-tree-view";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { ReactNode } from "react";

function renderBranchTreeItem(branchId: string, branches: Branch[]): ReactNode {
  const branch = branches.find((branch) => branch.id === branchId);
  if (!branch) return null;

  if ((branch.childBranches?.length ?? 0) === 0) {
    return (
      <TreeItem
        key={branchId}
        itemId={branchId}
        label={branch.localName ?? branch.name}
      />
    );
  }

  return (
    <TreeItem
      key={branchId}
      itemId={branchId}
      label={branch.localName ?? branch.name}
    >
      {branch.childBranches
        ?.sort((a, b) => {
          const aName = branches.find((branch) => branch.id === a)?.name;
          const bName = branches.find((branch) => branch.id === b)?.name;
          if (!aName || !bName) return 0;
          return aName.localeCompare(bName);
        })
        .map((childBranchId) => renderBranchTreeItem(childBranchId, branches))}
    </TreeItem>
  );
}

export default function SelectBranchTreeView({
  branches,
  onSelect,
}: {
  branches: Branch[];
  onSelect: (branchId: string) => void;
}) {
  return (
    <Stack>
      <Typography sx={{ ml: 4, mb: 1 }} variant={"h3"} fontWeight={"bolder"}>
        Velg filial
      </Typography>
      <SimpleTreeView
        onItemSelectionToggle={(_, branchId, isSelected) => {
          if (isSelected) onSelect(branchId);
        }}
      >
        {branches
          ?.filter((branch) => !branch.parentBranch)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((branch) => renderBranchTreeItem(branch.id, branches))}
      </SimpleTreeView>
    </Stack>
  );
}
