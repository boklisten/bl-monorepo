"use client";

import { Branch } from "@boklisten/backend/shared/branch/branch";
import { Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import BranchSettings from "@/components/branches/BranchSettings";
import SelectBranchTreeView from "@/components/branches/SelectBranchTreeView";
import unpack from "@/utils/api/bl-api-request";
import useApiClient from "@/utils/api/useApiClient";

export default function DatabaseBranchesPage() {
  const client = useApiClient();
  const branchQuery = {
    query: { sort: "name" },
  };
  const { data: branches } = useQuery({
    queryKey: [client.$url("collection.branches.getAll", branchQuery)],
    queryFn: () =>
      client
        .$route("collection.branches.getAll")
        .$get(branchQuery)
        .then(unpack<Branch[]>),
  });

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  return (
    <Stack
      direction={"row"}
      sx={{
        display: "flex",
        flexWrap: 1,
        justifyContent: "space-between",
        gap: 5,
      }}
    >
      <SelectBranchTreeView
        branches={branches ?? []}
        onSelect={(branchId) => {
          setSelectedBranch(
            branches?.find((branch) => branch.id === branchId) ?? null,
          );
        }}
      />
      {selectedBranch && <BranchSettings branch={selectedBranch} />}
    </Stack>
  );
}
