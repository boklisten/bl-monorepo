"use client";
import BlFetcher from "@frontend/api/blFetcher";
import BranchSelect from "@frontend/components/BranchSelect";
import BranchInfo from "@frontend/components/info/BranchInfo";
import DynamicNav from "@frontend/components/info/DynamicNav";
import BL_CONFIG from "@frontend/utils/bl-config";
import { infoPageTabs } from "@frontend/utils/constants";
import { assertBlApiError } from "@frontend/utils/types";
import { useGlobalState } from "@frontend/utils/useGlobalState";
import { Card, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Branch } from "@shared/branch/branch";
import { OpeningHour } from "@shared/opening-hour/opening-hour";
import moment from "moment/moment";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface BranchData {
  branch: Branch | null;
  openingHours: OpeningHour[];
}

async function getBranchData(branchId: string): Promise<BranchData> {
  const branchUrl = `${BL_CONFIG.collection.branch}/${branchId}`;
  const now = moment().startOf("day").format("DDMMYYYYHHmm");
  const openingHoursUrl = `${BL_CONFIG.collection.openingHour}?branch=${branchId}&from=>${now}`;
  const branchData: BranchData = { branch: null, openingHours: [] };
  try {
    const branches = await BlFetcher.get<Branch[]>(branchUrl);
    branchData.branch = branches[0] ?? null;
  } catch (error) {
    assertBlApiError(error);
  }
  try {
    const openingHoursResult =
      await BlFetcher.get<OpeningHour[]>(openingHoursUrl);
    branchData.openingHours = openingHoursResult ?? [];
  } catch (error) {
    assertBlApiError(error);
  }

  return branchData;
}

function LinkableBranchInfo({
  cachedBranch,
  cachedOpeningHours,
}: {
  cachedBranch: Branch | null;
  cachedOpeningHours: OpeningHour[];
}) {
  const [branch, setBranch] = useState(cachedBranch);
  const [openingHours, setOpeningHours] = useState(cachedOpeningHours);
  const router = useRouter();
  const { selectedBranchId } = useGlobalState();

  useEffect(() => {
    if (branch === null && selectedBranchId) {
      return router.push(`/info/branch/${selectedBranchId}`);
    }
    async function getFreshBranchInfo() {
      if (branch?.id) {
        const branchData = await getBranchData(branch.id);
        setBranch(branchData.branch);
        setOpeningHours(branchData.openingHours);
      }
    }
    getFreshBranchInfo();
    console.log("use effekt lol");
  }, [branch, router, selectedBranchId]);

  return (
    <>
      <Card>
        <DynamicNav tabs={infoPageTabs} twoRows />
        {branch === null && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 2,
            }}
          >
            <Typography
              variant="h4"
              sx={{ textAlign: "center", marginTop: 4, marginBottom: 2 }}
            >
              Velg din skole
            </Typography>
            <BranchSelect />
          </Box>
        )}
        {branch?.name && (
          <BranchInfo branch={branch} openingHours={openingHours} />
        )}
      </Card>
    </>
  );
}

export default LinkableBranchInfo;
