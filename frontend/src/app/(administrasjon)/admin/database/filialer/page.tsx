"use client";

import SelectBranchTreeView from "@/components/branches/SelectBranchTreeView";

export default function DatabaseBranchesPage() {
  return (
    <>
      <SelectBranchTreeView
        onSelect={(branchId) => {
          console.log("Selected branch", branchId);
        }}
      />
    </>
  );
}
