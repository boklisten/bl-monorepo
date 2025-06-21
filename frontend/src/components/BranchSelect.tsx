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

import unpack from "@/utils/api/bl-api-request";
import useApiClient from "@/utils/api/useApiClient";
import { useGlobalState } from "@/utils/useGlobalState";

const BranchSelect = ({ isNav }: { isNav?: boolean }) => {
  const client = useApiClient();
  const branchQuery = {
    query: { active: true, "isBranchItemsLive.online": true, sort: "name" },
  };
  const { data: branches } = useQuery({
    queryKey: [client.$url("collection.branches.getAll", branchQuery)],
    queryFn: () =>
      client
        .$route("collection.branches.getAll")
        .$get(branchQuery)
        .then(unpack<Branch[]>),
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
          id="demo-simple-select-label"
          sx={{ color: isNav ? "white" : "inherit" }}
        >
          {selectedBranchId ? "Valgt skole" : "Velg skole"}
        </InputLabel>
        <Select
          sx={{ color: isNav ? "white" : "inherit" }}
          value={selectedBranchId ?? ""}
          label="Valgt skole"
          onChange={handleChange}
        >
          {branches?.map((branch) => (
            <MenuItem value={branch.id} key={branch.id}>
              {branch.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default BranchSelect;
