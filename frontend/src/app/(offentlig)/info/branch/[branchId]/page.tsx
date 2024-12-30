import BlFetcher from "@frontend/api/blFetcher";
import BranchSelect from "@frontend/components/BranchSelect";
import BranchLocationInfo, {
  BranchLocationInfoSkeleton,
} from "@frontend/components/info/BranchLocationInfo";
import BranchOpeningHours, {
  BranchOpeningHoursSkeleton,
} from "@frontend/components/info/BranchOpeningHours";
import BL_CONFIG from "@frontend/utils/bl-config";
import { Box, Typography } from "@mui/material";
import { Branch } from "@shared/branch/branch";
import { OpeningHour } from "@shared/opening-hour/opening-hour";
import moment from "moment";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Skoler og åpningstider",
  description:
    "Skal du hente eller levere bøker? Finn ut når vi står på stand på din skole.",
};

export default async function BranchPage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;
  const branchUrl = `${BL_CONFIG.collection.branch}/${branchId}`;
  const now = moment().startOf("day").format("DDMMYYYYHHmm");
  const openingHoursUrl = `${BL_CONFIG.collection.openingHour}?branch=${branchId}&from=>${now}`;

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography variant="h4" sx={{ textAlign: "center", marginTop: 4 }}>
        Åpningstider
      </Typography>
      <Box sx={{ my: 3.5 }}>
        <BranchSelect />
      </Box>
      <Suspense fallback={<BranchLocationInfoSkeleton />}>
        <BranchLocationInfo
          branchPromise={BlFetcher.get<[Branch]>(branchUrl)}
        />
      </Suspense>
      <Suspense fallback={<BranchOpeningHoursSkeleton />}>
        <BranchOpeningHours
          branchPromise={BlFetcher.get<[Branch]>(branchUrl)}
          openingHoursPromise={BlFetcher.get<OpeningHour[]>(openingHoursUrl)}
        />
      </Suspense>
    </Box>
  );
}
