"use client";
import BlFetcher from "@frontend/api/blFetcher";
import BL_CONFIG from "@frontend/utils/bl-config";
import { useGlobalState } from "@frontend/utils/useGlobalState";
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
import useSWR from "swr";

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

    if (pathName.includes("info/branch")) {
      router.push(`/info/branch/${branchId}`);
    }
  };

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
