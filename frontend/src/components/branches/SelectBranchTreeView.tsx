import { Branch } from "@boklisten/backend/shared/branch/branch";
import { TreeItem } from "@mui/x-tree-view";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { ReactNode } from "react";

function renderBranchTreeItem(branchId: string, branches: Branch[]): ReactNode {
  const branch = branches.find((branch) => branch.id === branchId);
  if (!branch) return null;

  if ((branch.childBranches?.length ?? 0) === 0) {
    return <TreeItem key={branch.id} itemId={branch.id} label={branch.name} />;
  }

  return branch.childBranches?.map((branchId) =>
    renderBranchTreeItem(branchId, branches),
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
    <SimpleTreeView
      onItemSelectionToggle={(_, branchId, isSelected) => {
        if (isSelected) onSelect(branchId);
      }}
    >
      {branches?.map((branch) => renderBranchTreeItem(branch.id, branches))}
    </SimpleTreeView>
  );
}
