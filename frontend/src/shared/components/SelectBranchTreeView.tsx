import { Branch } from "@boklisten/backend/shared/branch";
import { NavLink, Stack, Title, Tree, TreeNodeData } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";

function toTreeNodeData(branches: Branch[]) {
  const branchById = new Map(branches.map((b) => [b.id, b]));

  const toNode = (branch: Branch) => ({
    value: branch.id,
    label: branch.localName ?? branch.name,
    children: createChildren(branch),
  });

  function createChildren(branch: Branch): TreeNodeData[] {
    return (branch.childBranches ?? [])
      .map((childBranchId) => branchById.get(childBranchId))
      .filter((childBranch) => childBranch !== undefined)
      .map(toNode)
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  return branches
    .filter((branch) => !branch.parentBranch)
    .map(toNode)
    .sort((a, b) => a.label.localeCompare(b.label));
}

export default function SelectBranchTreeView({
  label,
  branches,
  onSelect,
  onlyLeafs,
}: {
  label: string;
  branches: Branch[];
  onSelect: (branchId: string) => void;
  onlyLeafs?: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <Stack>
      <Title order={3}>{label}</Title>
      <Tree
        data={toTreeNodeData(branches)}
        renderNode={({ node, expanded, hasChildren, elementProps }) => (
          <NavLink
            {...elementProps}
            label={node.label}
            onClick={(event) => {
              elementProps.onClick(event);
              if (onlyLeafs && (node.children?.length ?? 0) > 0) return;
              setSelected(node.value);
              onSelect(node.value);
            }}
            leftSection={
              (hasChildren && !onlyLeafs) ||
              (hasChildren && onlyLeafs && expanded) ? (
                <IconChevronRight
                  size={18}
                  style={{
                    transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                />
              ) : (
                <></>
              )
            }
            active={selected === node.value}
          />
        )}
      />
    </Stack>
  );
}
