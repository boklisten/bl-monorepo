"use client";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { Branch } from "@shared/branch/branch";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";

import BlFetcher from "@/api/blFetcher";
import BL_CONFIG from "@/utils/bl-config";
import { useGlobalState } from "@/utils/useGlobalState";

const BranchSelect = ({ isNav }: { isNav?: boolean }) => {
  const { data: branches } = useSWR(
    `${BL_CONFIG.collection.branch}?active=true&sort=name`,
    BlFetcher.get<Branch[]>,
  );

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
