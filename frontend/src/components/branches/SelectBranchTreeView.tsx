import { Branch } from "@boklisten/backend/shared/branch/branch";
import { TreeItem } from "@mui/x-tree-view";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { useQuery } from "@tanstack/react-query";
import { ReactNode } from "react";

import unpack from "@/utils/api/bl-api-request";
import useApiClient from "@/utils/api/useApiClient";

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
  onSelect,
}: {
  onSelect: (branchId: string) => void;
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
