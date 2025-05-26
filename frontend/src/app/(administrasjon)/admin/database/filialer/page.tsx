"use client";

import { Branch } from "@boklisten/backend/shared/branch/branch";
import { AddBusiness } from "@mui/icons-material";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import BranchSettings from "@/components/branches/BranchSettings";
import CreateBranchDialog from "@/components/branches/CreateBranchDialog";
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
  const [isCreateOpen, setCreateOpen] = useState(false);
  return (
    <Box>
      <Button
        startIcon={<AddBusiness />}
        color={"primary"}
        sx={{ mb: 1, ml: 3 }}
        onClick={() => setCreateOpen(true)}
      >
        Opprett filial
      </Button>
      <Divider sx={{ mb: 2 }} />
      <Stack
        direction={"row"}
        sx={{
          display: "flex",
          flexWrap: "wrap",
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
        {selectedBranch && (
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant={"h1"} sx={{ ml: 2 }}>
              Rediger filial
            </Typography>
            <BranchSettings branch={selectedBranch} />
          </Box>
        )}
      </Stack>
      <CreateBranchDialog
        open={isCreateOpen}
        onClose={() => setCreateOpen(false)}
      />
    </Box>
  );
}
