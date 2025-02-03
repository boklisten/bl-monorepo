"use client";
import { Branch } from "@boklisten/backend/shared/branch/branch";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import BlFetcher from "@/api/blFetcher";
import useApiClient from "@/utils/api/useApiClient";
import { useGlobalState } from "@/utils/useGlobalState";

const BranchSelect = ({ isNav }: { isNav?: boolean }) => {
  const client = useApiClient();
  const { data: branches } = useQuery({
    queryKey: [
      client.$url("collection.branches.getAll", {
        query: { active: true, sort: "name" },
      }),
    ],
    queryFn: ({ queryKey }) => BlFetcher.get<Branch[]>(queryKey[0] ?? ""),
  });

  const { selectedBranchId, selectBranch } = useGlobalState();

  const router = useRouter();
  const pathName = usePathname();

  const handleChange = (event: SelectChangeEvent) => {
    const branchId = event.target.value;
    selectBranch(branchId);
  };

  useEffect(() => {
    if (selectedBranchId && pathName.includes("info/branch")) {
      router.replace(`/info/branch/${selectedBranchId}`);
    }
  }, [pathName, router, selectedBranchId]);

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel
          data-testid="branchSelectLabel"
          id="demo-simple-select-label"
          sx={{ color: isNav ? "white" : "inherit" }}
        >
          {selectedBranchId ? "Valgt skole" : "Velg skole"}
        </InputLabel>
        <Select
          data-testid="branchSelect"
          sx={{ color: isNav ? "white" : "inherit" }}
          value={selectedBranchId ?? ""}
          label="Valgt skole"
          onChange={handleChange}
        >
          {branches?.map((branch) => (
            <MenuItem
              data-testid="branchOption"
              value={branch.id}
              key={branch.id}
            >
              {branch.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default BranchSelect;
