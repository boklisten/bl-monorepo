import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Box, Skeleton } from "@mui/material";
import { Branch } from "@shared/branch/branch";
import { ReactNode, use } from "react";

function BranchLocationInfoBase({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: "flex", marginBottom: 2 }} data-testid="branch-address">
      <LocationOnIcon />
      {children}
    </Box>
  );
}

export function BranchLocationInfoSkeleton() {
  return (
    <BranchLocationInfoBase>
      <Skeleton width={150} />
    </BranchLocationInfoBase>
  );
}

export default function BranchLocationInfo({
  branchPromise,
}: {
  branchPromise: Promise<[Branch]>;
}) {
  const [branch] = use(branchPromise);
  if (!branch.location?.address) {
    return <></>;
  }
  return (
    <BranchLocationInfoBase>{branch.location?.address}</BranchLocationInfoBase>
  );
}
